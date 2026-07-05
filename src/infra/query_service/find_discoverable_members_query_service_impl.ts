import { IFindDiscoverableMembersQueryService } from "../../application_service/member/i_find_discoverable_members_query_service";
import type { Kysely } from "kysely";
import type { Database } from "../database/types";

export class FindDiscoverableMembersQueryServiceImpl implements IFindDiscoverableMembersQueryService {
  constructor(private readonly _db: Kysely<Database>) {}

  async execute(input: { viewerMemberId: string; genders: string[] | null }) {
    let query = this._db
      .selectFrom("members")
      .innerJoin("profiles", "profiles.member_id", "members.id")
      .leftJoin("likes", (join) =>
        join
          .onRef("likes.to_member_id", "=", "members.id")
          .on("likes.from_member_id", "=", input.viewerMemberId),
      )
      .select([
        "members.id",
        "members.name",
        "members.email",
        "profiles.top_image_path",
        "likes.id as like_id",
      ])
      .where("members.id", "<>", input.viewerMemberId);

    if (input.genders !== null) {
      query = query.where("profiles.gender", "in", input.genders);
    }

    const rows = await query.execute();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      hasLiked: row.like_id !== null,
      topImagePath: row.top_image_path,
    }));
  }
}
