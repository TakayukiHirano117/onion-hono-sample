import { describe, expect, it, vi } from "vitest";
import type { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { Profile } from "../../domain/profile/profile";
import { Bio } from "../../domain/profile/vo/bio";
import { BirthDate } from "../../domain/profile/vo/birth_date";
import { Gender } from "../../domain/profile/vo/gender";
import { TopImagePath } from "../../domain/profile/vo/top_image_path";
import { UUID } from "../../domain/shared/vo/uuid";
import type {
  IImageUploader,
  ImageMetadata,
  PrepareImageUploadInput,
  PreparedImageUpload,
} from "../../infra/shared/i_image_uploader";
import { ConflictError } from "../shared/exception/application_error";
import { StubTopImageUrlResolver } from "../shared/stub_top_image_url_resolver";
import { CompleteTopImageUploadAppService } from "./complete_top_image_upload_app_service";

const memberId = "00000000-0000-4000-8000-000000000001";
const uploadId = "00000000-0000-4000-8000-000000000002";
const competingUploadId = "00000000-0000-4000-8000-000000000003";
const previousPath = new TopImagePath("photos/00000000-0000-4000-8000-000000000001/top.png");
const finalPath = new TopImagePath(`photos/${memberId}/${uploadId}.jpg`);

class InMemoryProfileRepository implements IProfileRepository {
  readonly updateTopImagePathIfCurrent = vi.fn(
    async (
      _memberId: UUID,
      _currentPath: TopImagePath | null,
      _nextPath: TopImagePath | null,
    ): Promise<boolean> => {
      if (this.updateError) {
        throw this.updateError;
      }
      return this.casResult;
    },
  );
  private findCallCount = 0;

  constructor(
    private readonly profiles: Profile[],
    private readonly casResult = true,
    private readonly updateError?: Error,
  ) {}

  async create(): Promise<void> {}

  async findByMemberId(): Promise<Profile | null> {
    const profile = this.profiles[Math.min(this.findCallCount, this.profiles.length - 1)] ?? null;
    this.findCallCount += 1;
    return profile;
  }

  async updateTopImagePath(): Promise<void> {}
}

class ConcurrentProfileRepository implements IProfileRepository {
  constructor(private profile: Profile) {}

  async create(): Promise<void> {}

  async findByMemberId(): Promise<Profile> {
    return this.profile;
  }

  async updateTopImagePath(_memberId: UUID, topImagePath: TopImagePath | null): Promise<void> {
    this.profile = this.profile.withTopImagePath(topImagePath);
  }

  async updateTopImagePathIfCurrent(
    _memberId: UUID,
    currentPath: TopImagePath | null,
    nextPath: TopImagePath | null,
  ): Promise<boolean> {
    if (this.profile.topImagePath?.value !== currentPath?.value) {
      return false;
    }

    this.profile = this.profile.withTopImagePath(nextPath);
    return true;
  }
}

class StubImageUploader implements IImageUploader {
  readonly copied: Array<[string, string]> = [];
  readonly bestEffortDeleted: string[] = [];
  readonly headed: string[] = [];

  constructor(
    private readonly metadataByKey: ReadonlyMap<string, ImageMetadata>,
    private readonly failBestEffortDelete = false,
    private readonly copyError?: Error,
  ) {}

  async prepare(_input: PrepareImageUploadInput): Promise<PreparedImageUpload> {
    throw new Error("not used");
  }

  async head(key: string): Promise<ImageMetadata | null> {
    this.headed.push(key);
    return this.metadataByKey.get(key) ?? null;
  }

  async copy(sourceKey: string, destinationKey: string): Promise<void> {
    this.copied.push([sourceKey, destinationKey]);
    if (this.copyError) {
      throw this.copyError;
    }
  }

  async deleteBestEffort(key: string): Promise<void> {
    this.bestEffortDeleted.push(key);
    if (this.failBestEffortDelete) {
      return;
    }
  }
}

const createProfile = (topImagePath: TopImagePath | null = previousPath): Profile =>
  Profile.create(
    new UUID(memberId),
    new Bio("hello"),
    new Gender("male"),
    new BirthDate("1990/01/01"),
    topImagePath,
  );

const pendingKey = `pending/${memberId}/${uploadId}.jpg`;
const createUploader = (
  metadataByKey: ReadonlyMap<string, ImageMetadata> = new Map([
    [pendingKey, { contentType: "image/jpeg", contentLength: 1024 }],
  ]),
  failBestEffortDelete = false,
) => new StubImageUploader(metadataByKey, failBestEffortDelete);

const createService = (repository: IProfileRepository, uploader: IImageUploader) =>
  new CompleteTopImageUploadAppService(
    repository,
    uploader,
    new StubTopImageUrlResolver("https://cdn.example.com"),
  );

const request = {
  viewerMemberId: memberId,
  uploadId,
  contentType: "image/jpeg",
};

describe("CompleteTopImageUploadAppService", () => {
  it("旧pathを条件にCAS更新し、旧画像をbest-effort削除する", async () => {
    const repository = new InMemoryProfileRepository([createProfile()]);
    const uploader = createUploader();

    const result = await createService(repository, uploader).execute(request);

    expect(uploader.copied).toEqual([[pendingKey, finalPath.value]]);
    expect(repository.updateTopImagePathIfCurrent).toHaveBeenCalledWith(
      new UUID(memberId),
      previousPath,
      finalPath,
    );
    expect(uploader.bestEffortDeleted).toEqual([pendingKey, previousPath.value]);
    expect(result).toEqual({
      topImageUrl: `https://cdn.example.com/${finalPath.value}`,
    });
  });

  it("初回成功後の再実行はfinal objectを確認して同じURLを返す", async () => {
    const repository = new InMemoryProfileRepository([createProfile(finalPath)]);
    const uploader = createUploader(
      new Map([[finalPath.value, { contentType: "image/jpeg", contentLength: 1024 }]]),
    );

    const result = await createService(repository, uploader).execute(request);

    expect(result.topImageUrl).toBe(`https://cdn.example.com/${finalPath.value}`);
    expect(uploader.headed).toEqual([finalPath.value]);
    expect(uploader.copied).toEqual([]);
    expect(repository.updateTopImagePathIfCurrent).not.toHaveBeenCalled();
  });

  it("異なるuploadのCAS競合敗者は所有不明のfinalを削除せず409にする", async () => {
    const competingPath = new TopImagePath(`photos/${memberId}/${competingUploadId}.jpg`);
    const repository = new InMemoryProfileRepository(
      [createProfile(), createProfile(competingPath)],
      false,
    );
    const uploader = createUploader();

    await expect(createService(repository, uploader).execute(request)).rejects.toThrow(
      ConflictError,
    );
    expect(uploader.bestEffortDeleted).toEqual([]);
  });

  it("同一会員の異なるcompleteを実際に並行実行して一方だけ成功させる", async () => {
    const secondPendingKey = `pending/${memberId}/${competingUploadId}.jpg`;
    const repository = new ConcurrentProfileRepository(createProfile());
    const uploader = createUploader(
      new Map([
        [pendingKey, { contentType: "image/jpeg", contentLength: 1024 }],
        [secondPendingKey, { contentType: "image/jpeg", contentLength: 1024 }],
      ]),
    );
    const service = createService(repository, uploader);

    const results = await Promise.allSettled([
      service.execute(request),
      service.execute({ ...request, uploadId: competingUploadId }),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((result) => result.status === "rejected");
    expect(rejected).toBeDefined();
    if (rejected?.status === "rejected") {
      expect(rejected.reason).toBeInstanceOf(ConflictError);
    }
    expect(uploader.bestEffortDeleted).toContain(previousPath.value);
    const deletedPendingKeys = uploader.bestEffortDeleted.filter((key) =>
      key.startsWith(`pending/${memberId}/`),
    );
    expect(deletedPendingKeys).toHaveLength(1);
    expect([pendingKey, secondPendingKey]).toContain(deletedPendingKeys[0]);
  });

  it("同一uploadIdを実際に並行実行してCAS敗者も冪等成功にする", async () => {
    const repository = new ConcurrentProfileRepository(createProfile());
    const uploader = createUploader(
      new Map([
        [pendingKey, { contentType: "image/jpeg", contentLength: 1024 }],
        [finalPath.value, { contentType: "image/jpeg", contentLength: 1024 }],
      ]),
    );
    const service = createService(repository, uploader);

    const results = await Promise.all([service.execute(request), service.execute(request)]);

    expect(results).toEqual([
      { topImageUrl: `https://cdn.example.com/${finalPath.value}` },
      { topImageUrl: `https://cdn.example.com/${finalPath.value}` },
    ]);
    expect(uploader.copied).toHaveLength(2);
    expect(uploader.bestEffortDeleted).toEqual([pendingKey, previousPath.value]);
  });

  it("同じuploadの並行complete競合は冪等成功にする", async () => {
    const repository = new InMemoryProfileRepository(
      [createProfile(), createProfile(finalPath)],
      false,
    );
    const uploader = createUploader(
      new Map([
        [pendingKey, { contentType: "image/jpeg", contentLength: 1024 }],
        [finalPath.value, { contentType: "image/jpeg", contentLength: 1024 }],
      ]),
    );

    await expect(createService(repository, uploader).execute(request)).resolves.toEqual({
      topImageUrl: `https://cdn.example.com/${finalPath.value}`,
    });
    expect(uploader.bestEffortDeleted).toEqual([]);
  });

  it("競合相手がpending削除後にCopyが失敗してもfinalとprofile一致なら冪等成功にする", async () => {
    const repository = new InMemoryProfileRepository([createProfile(), createProfile(finalPath)]);
    const uploader = new StubImageUploader(
      new Map([
        [pendingKey, { contentType: "image/jpeg", contentLength: 1024 }],
        [finalPath.value, { contentType: "image/jpeg", contentLength: 1024 }],
      ]),
      false,
      new Error("NoSuchKey"),
    );

    await expect(createService(repository, uploader).execute(request)).resolves.toEqual({
      topImageUrl: `https://cdn.example.com/${finalPath.value}`,
    });
    expect(repository.updateTopImagePathIfCurrent).not.toHaveBeenCalled();
  });

  it("DB更新成功後の旧画像削除失敗は成功レスポンスを維持する", async () => {
    const repository = new InMemoryProfileRepository([createProfile()]);
    const uploader = createUploader(undefined, true);

    await expect(createService(repository, uploader).execute(request)).resolves.toEqual({
      topImageUrl: `https://cdn.example.com/${finalPath.value}`,
    });
    expect(uploader.bestEffortDeleted).toEqual([pendingKey, previousPath.value]);
  });

  it("S3実体のContent-Typeが要求と違う場合は昇格しない", async () => {
    const repository = new InMemoryProfileRepository([createProfile()]);
    const uploader = createUploader(
      new Map([[pendingKey, { contentType: "image/png", contentLength: 1024 }]]),
    );

    await expect(createService(repository, uploader).execute(request)).rejects.toThrow(
      "アップロード済み画像の形式が不正です。",
    );
    expect(uploader.copied).toEqual([]);
  });

  it("DB更新結果不明時は所有不明のfinalを削除しない", async () => {
    const repository = new InMemoryProfileRepository(
      [createProfile()],
      true,
      new Error("database failed"),
    );
    const uploader = createUploader();

    await expect(createService(repository, uploader).execute(request)).rejects.toThrow(
      "database failed",
    );
    expect(uploader.bestEffortDeleted).toEqual([]);
  });
});
