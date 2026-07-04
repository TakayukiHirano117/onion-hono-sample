import { IFindLikedMembersQueryService } from "../../application_service/like/i_find_liked_members_query_service";
import type { Kysely } from "kysely";
import type { Database } from "../database/types";

export class FindLikedMembersQueryServiceImpl implements IFindLikedMembersQueryService {
  constructor(private readonly _db: Kysely<Database>) {}

  async execute(viewerMemberId: string) {
    const rows = await this._db
      .selectFrom("likes")
      .innerJoin("members", "members.id", "likes.to_member_id")
      .innerJoin("profiles", "profiles.member_id", "members.id")
      .select([
        "members.id",
        "members.name",
        "members.email",
        "profiles.top_image_path",
      ])
      .where("likes.from_member_id", "=", viewerMemberId)
      .orderBy("likes.created_at", "desc")
      .execute();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      hasLiked: true,
      topImagePath: row.top_image_path,
    }));
  }
}
