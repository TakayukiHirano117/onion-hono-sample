import { describe, expect, it } from "vitest";
import { Profile } from "../../domain/profile/profile";
import type { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { Bio } from "../../domain/profile/vo/bio";
import { BirthDate } from "../../domain/profile/vo/birth_date";
import { Gender } from "../../domain/profile/vo/gender";
import { UUID } from "../../domain/shared/vo/uuid";
import { NotFoundError } from "../shared/exception/application_error";
import { StubTopImageUrlResolver } from "../shared/stub_top_image_url_resolver";
import { FindAllMemberAppService } from "./find_all_member_app_service";
import type { DiscoverableMemberRow } from "./discoverable_member_row";
import type { IFindDiscoverableMembersQueryService } from "./i_find_discoverable_members_query_service";

const viewerMemberId = "00000000-0000-4000-8000-000000000001";

class InMemoryProfileRepository implements IProfileRepository {
  constructor(private readonly profiles: Profile[]) {}

  async create(): Promise<void> {}

  async findByMemberId(memberId: UUID): Promise<Profile | null> {
    return this.profiles.find((profile) => profile.memberId.value === memberId.value) ?? null;
  }

  async updateTopImagePath(): Promise<void> {}
}

class StubFindDiscoverableMembersQueryService implements IFindDiscoverableMembersQueryService {
  readonly calls: {
    viewerMemberId: string;
    genders: string[] | null;
  }[] = [];

  constructor(private readonly result: DiscoverableMemberRow[] = []) {}

  async execute(input: { viewerMemberId: string; genders: string[] | null }) {
    this.calls.push(input);
    return this.result;
  }
}

const createProfile = (memberId: string, gender: string): Profile =>
  Profile.create(
    new UUID(memberId),
    new Bio("hello"),
    new Gender(gender),
    new BirthDate("1990/01/01"),
  );

describe("FindAllMemberAppService", () => {
  it("male 閲覧者には female のみを返す", async () => {
    const queryService = new StubFindDiscoverableMembersQueryService([
      {
        id: "00000000-0000-4000-8000-000000000002",
        name: "female member",
        email: "female@example.com",
        hasLiked: false,
        topImagePath: null,
      },
    ]);
    const service = new FindAllMemberAppService(
      new InMemoryProfileRepository([createProfile(viewerMemberId, "male")]),
      queryService,
      new StubTopImageUrlResolver(),
    );

    const result = await service.execute(viewerMemberId);

    expect(queryService.calls).toEqual([
      {
        viewerMemberId,
        genders: ["female"],
      },
    ]);
    expect(result).toEqual([
      {
        id: "00000000-0000-4000-8000-000000000002",
        name: "female member",
        email: "female@example.com",
        hasLiked: false,
        topImageUrl: null,
      },
    ]);
  });

  it("female 閲覧者には male のみを返す", async () => {
    const queryService = new StubFindDiscoverableMembersQueryService();
    const service = new FindAllMemberAppService(
      new InMemoryProfileRepository([createProfile(viewerMemberId, "female")]),
      queryService,
      new StubTopImageUrlResolver(),
    );

    await service.execute(viewerMemberId);

    expect(queryService.calls).toEqual([
      {
        viewerMemberId,
        genders: ["male"],
      },
    ]);
  });

  it("other 閲覧者には性別フィルタなしで返す", async () => {
    const queryService = new StubFindDiscoverableMembersQueryService();
    const service = new FindAllMemberAppService(
      new InMemoryProfileRepository([createProfile(viewerMemberId, "other")]),
      queryService,
      new StubTopImageUrlResolver(),
    );

    await service.execute(viewerMemberId);

    expect(queryService.calls).toEqual([
      {
        viewerMemberId,
        genders: null,
      },
    ]);
  });

  it("閲覧者プロフィールが存在しない場合はエラーにする", async () => {
    const service = new FindAllMemberAppService(
      new InMemoryProfileRepository([]),
      new StubFindDiscoverableMembersQueryService(),
      new StubTopImageUrlResolver(),
    );

    await expect(service.execute(viewerMemberId)).rejects.toThrow(NotFoundError);
  });
});
