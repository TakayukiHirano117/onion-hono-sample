import { describe, expect, it } from "vitest";
import type { FindLikedMembersAppServiceDto } from "./find_liked_members_app_service_dto";
import { FindLikedMembersAppService } from "./find_liked_members_app_service";
import type { IFindLikedMembersQueryService } from "./i_find_liked_members_query_service";

const viewerMemberId = "00000000-0000-4000-8000-000000000001";
const likedMemberId = "00000000-0000-4000-8000-000000000002";
const otherMemberId = "00000000-0000-4000-8000-000000000003";

class InMemoryFindLikedMembersQueryService implements IFindLikedMembersQueryService {
  constructor(private readonly membersByViewer: Record<string, FindLikedMembersAppServiceDto[]>) {}

  async execute(viewerMemberId: string): Promise<FindLikedMembersAppServiceDto[]> {
    return this.membersByViewer[viewerMemberId] ?? [];
  }
}

describe("FindLikedMembersAppService", () => {
  it("自分がいいねした会員一覧を返す", async () => {
    const likedMember: FindLikedMembersAppServiceDto = {
      id: likedMemberId,
      name: "liked member",
      email: "liked@example.com",
      hasLiked: true,
    };
    const service = new FindLikedMembersAppService(
      new InMemoryFindLikedMembersQueryService({
        [viewerMemberId]: [likedMember],
      }),
    );

    const result = await service.execute(viewerMemberId);

    expect(result).toEqual([likedMember]);
  });

  it("いいねがない場合は空配列を返す", async () => {
    const service = new FindLikedMembersAppService(
      new InMemoryFindLikedMembersQueryService({
        [viewerMemberId]: [],
      }),
    );

    const result = await service.execute(viewerMemberId);

    expect(result).toEqual([]);
  });

  it("他人のいいね一覧は含まれない", async () => {
    const likedMember: FindLikedMembersAppServiceDto = {
      id: likedMemberId,
      name: "liked member",
      email: "liked@example.com",
      hasLiked: true,
    };
    const service = new FindLikedMembersAppService(
      new InMemoryFindLikedMembersQueryService({
        [viewerMemberId]: [likedMember],
        [otherMemberId]: [],
      }),
    );

    const result = await service.execute(otherMemberId);

    expect(result).toEqual([]);
  });
});
