import { IFindByEmailForLoginQueryService } from "../../ApplicationService/Member/i_find_by_email_for_login_query_service";
import { Email } from "../../Domain/shared/vo/email";
import { Kysely } from "kysely";
import { Database } from "../Database/types";

export class FindByEmailForLoginQueryServiceImpl implements IFindByEmailForLoginQueryService {
  constructor(private readonly _db: Kysely<Database>) { }

  async execute(email: Email): Promise<{
    id: string;
    email: string;
    name: string;
    password_hash: string;
  } | null> {
    const row = await this._db.selectFrom("members").selectAll().where("email", "=", email.value).executeTakeFirst();
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      password_hash: row.password_hash,
    };
  }
}