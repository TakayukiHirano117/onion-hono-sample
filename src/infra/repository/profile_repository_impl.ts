import { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { Profile } from "../../domain/profile/profile";
import { BirthDate } from "../../domain/profile/vo/birth_date";
import { Bio } from "../../domain/profile/vo/bio";
import { Gender } from "../../domain/profile/vo/gender";
import { TopImagePath } from "../../domain/profile/vo/top_image_path";
import { UUID } from "../../domain/shared/vo/uuid";
import { resolveExecutor } from "../database/executor";
import type { Kysely } from "kysely";
import type { Database, ProfileRow } from "../database/types";

export class ProfileRepositoryImpl implements IProfileRepository {
  constructor(private readonly _db: Kysely<Database>) {}

  async create(profile: Profile, tx?: unknown): Promise<void> {
    const executor = resolveExecutor(this._db, tx);

    await executor
      .insertInto("profiles")
      .values({
        member_id: profile.memberId.value,
        bio: profile.bio.value,
        gender: profile.gender.value,
        birth_date: profile.birthDate.value,
        top_image_path: profile.topImagePath?.value ?? null,
      })
      .execute();
  }

  async findByMemberId(memberId: UUID): Promise<Profile | null> {
    const row = await this._db
      .selectFrom("profiles")
      .selectAll()
      .where("member_id", "=", memberId.value)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return this.toProfile(row);
  }

  async updateTopImagePath(
    memberId: UUID,
    topImagePath: TopImagePath | null,
    tx?: unknown,
  ): Promise<void> {
    const executor = resolveExecutor(this._db, tx);

    await executor
      .updateTable("profiles")
      .set({ top_image_path: topImagePath?.value ?? null })
      .where("member_id", "=", memberId.value)
      .execute();
  }

  private toProfile(row: ProfileRow): Profile {
    return Profile.reconstruct(
      new UUID(row.member_id),
      new Bio(row.bio),
      new Gender(row.gender),
      new BirthDate(this.formatBirthDate(row.birth_date)),
      row.top_image_path ? new TopImagePath(row.top_image_path) : null,
    );
  }

  private formatBirthDate(birthDate: ProfileRow["birth_date"]): string {
    if (birthDate instanceof Date) {
      const year = birthDate.getFullYear();
      const month = String(birthDate.getMonth() + 1).padStart(2, "0");
      const day = String(birthDate.getDate()).padStart(2, "0");
      return `${year}/${month}/${day}`;
    }

    return birthDate.replaceAll("-", "/");
  }
}
