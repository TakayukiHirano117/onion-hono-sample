import { describe, expect, it } from "vitest";
import { StubTopImageUrlResolver } from "../shared/stub_top_image_url_resolver";
import { FindLikedMembersAppService } from "./find_liked_members_app_service";
import type {
  IFindLikedMembersQueryService,
  LikedMemberQueryResult,
} from "./i_find_liked_members_query_service";

const viewerMemberId = "00000000-0000-4000-8000-000000000001";
const likedMemberId = "00000000-0000-4000-8000-000000000002";
const otherMemberId = "00000000-0000-4000-8000-000000000003";

class InMemoryFindLikedMembersQueryService implements IFindLikedMembersQueryService {
  constructor(private readonly membersByViewer: Record<string, LikedMemberQueryResult[]>) {}

  async execute(viewerMemberId: string): Promise<LikedMemberQueryResult[]> {
    return this.membersByViewer[viewerMemberId] ?? [];
  }
}

describe("FindLikedMembersAppService", () => {
  it("自分がいいねした会員一覧を返す", async () => {
    const likedMember: LikedMemberQueryResult = {
      id: likedMemberId,
      name: "liked member",
      email: "liked@example.com",
      hasLiked: true,
      topImagePath: null,
    };
    const service = new FindLikedMembersAppService(
      new InMemoryFindLikedMembersQueryService({
        [viewerMemberId]: [likedMember],
      }),
      new StubTopImageUrlResolver(),
    );

    const result = await service.execute(viewerMemberId);

    expect(result).toEqual([
      {
        id: likedMemberId,
        name: "liked member",
        email: "liked@example.com",
        hasLiked: true,
        topImageUrl: null,
      },
    ]);
  });

  it("いいねがない場合は空配列を返す", async () => {
    const service = new FindLikedMembersAppService(
      new InMemoryFindLikedMembersQueryService({
        [viewerMemberId]: [],
      }),
      new StubTopImageUrlResolver(),
    );

    const result = await service.execute(viewerMemberId);

    expect(result).toEqual([]);
  });

  it("他人のいいね一覧は含まれない", async () => {
    const likedMember: LikedMemberQueryResult = {
      id: likedMemberId,
      name: "liked member",
      email: "liked@example.com",
      hasLiked: true,
      topImagePath: "members/00000000-0000-4000-8000-000000000002/top.webp",
    };
    const service = new FindLikedMembersAppService(
      new InMemoryFindLikedMembersQueryService({
        [viewerMemberId]: [likedMember],
        [otherMemberId]: [],
      }),
      new StubTopImageUrlResolver(),
    );

    const result = await service.execute(otherMemberId);

    expect(result).toEqual([]);
  });
});
