import { describe, expect, it } from "vitest";
import { Profile } from "../../domain/profile/profile";
import type { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { Bio } from "../../domain/profile/vo/bio";
import { BirthDate } from "../../domain/profile/vo/birth_date";
import { Gender } from "../../domain/profile/vo/gender";
import { TopImagePath } from "../../domain/profile/vo/top_image_path";
import { UUID } from "../../domain/shared/vo/uuid";
import type { IObjectStorage } from "../shared/i_object_storage";
import { StubTopImageUrlResolver } from "../shared/stub_top_image_url_resolver";
import { UploadTopImageAppService } from "./upload_top_image_app_service";

const memberId = "00000000-0000-4000-8000-000000000001";

class InMemoryProfileRepository implements IProfileRepository {
  constructor(private readonly profiles: Profile[]) {}

  paths: TopImagePath[] = [];

  async create(): Promise<void> {}

  async findByMemberId(id: UUID): Promise<Profile | null> {
    return this.profiles.find((profile) => profile.memberId.value === id.value) ?? null;
  }

  async updateTopImagePath(_memberId: UUID, path: TopImagePath): Promise<void> {
    this.paths.push(path);
  }
}

class InMemoryObjectStorage implements IObjectStorage {
  readonly stored: { key: string; body: Uint8Array; contentType: string }[] = [];

  async put(key: string, body: Uint8Array, contentType: string): Promise<void> {
    this.stored.push({ key, body, contentType });
  }

  async get() {
    return null;
  }
}

const createProfile = (): Profile =>
  Profile.create(
    new UUID(memberId),
    new Bio("hello"),
    new Gender("male"),
    new BirthDate("1990/01/01"),
  );

describe("UploadTopImageAppService", () => {
  it("トップ画像を保存して URL を返す", async () => {
    const profileRepository = new InMemoryProfileRepository([createProfile()]);
    const objectStorage = new InMemoryObjectStorage();
    const service = new UploadTopImageAppService(
      profileRepository,
      objectStorage,
      new StubTopImageUrlResolver(),
    );

    const result = await service.execute({
      memberId,
      bytes: new Uint8Array([1, 2, 3]),
      contentType: "image/png",
    });

    expect(result.topImageUrl).toBe(
      "http://localhost:3000/api/v1/media/members/00000000-0000-4000-8000-000000000001/top.png",
    );
    expect(objectStorage.stored).toHaveLength(1);
    expect(profileRepository.paths).toHaveLength(1);
  });
});
