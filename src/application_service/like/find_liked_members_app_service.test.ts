import { describe, expect, it } from "vitest";
import type { LikedMemberRow } from "./liked_member_row";
import { FindLikedMembersAppService } from "./find_liked_members_app_service";
import type { IFindLikedMembersQueryService } from "./i_find_liked_members_query_service";
import { StubTopImageUrlResolver } from "../shared/stub_top_image_url_resolver";

const viewerMemberId = "00000000-0000-4000-8000-000000000001";
const likedMemberId = "00000000-0000-4000-8000-000000000002";
const otherMemberId = "00000000-0000-4000-8000-000000000003";

class InMemoryFindLikedMembersQueryService implements IFindLikedMembersQueryService {
  constructor(private readonly membersByViewer: Record<string, LikedMemberRow[]>) {}

  async execute(viewerMemberId: string): Promise<LikedMemberRow[]> {
    return this.membersByViewer[viewerMemberId] ?? [];
  }
}

describe("FindLikedMembersAppService", () => {
  it("自分がいいねした会員一覧を返す", async () => {
    const likedMember: LikedMemberRow = {
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
    const likedMember: LikedMemberRow = {
      id: likedMemberId,
      name: "liked member",
      email: "liked@example.com",
      hasLiked: true,
      topImagePath: null,
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
