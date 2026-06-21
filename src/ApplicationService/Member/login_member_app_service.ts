import { IPasswordVerificationDomainService } from "../../Domain/Member/i_password_verification_domain_service";
import { Name } from "../../Domain/Member/vo/name";
import { Member } from "../../Domain/Member/member";
import { Email } from "../../Domain/shared/vo/email";
import { UUID } from "../../Domain/shared/vo/uuid";
import { ILoginSessionGenerator } from "../../Infra/shared/i_login_session_generator";
import { UUIDGenerator } from "../../Infra/shared/uuid_generator";
import { IFindByEmailForLoginQueryService } from "./i_find_by_email_for_login_query_service";

type LoginMemberInput = {
  email: string;
  password: string;
};

export class LoginMemberAppService {
  constructor(
    private readonly _passwordVerificationDomainService: IPasswordVerificationDomainService,
    private readonly _findByEmailForLoginQueryService: IFindByEmailForLoginQueryService,
    private readonly _uuidGenerator: UUIDGenerator,
    private readonly _loginSessionGenerator: ILoginSessionGenerator
  ) { }

  async execute(input: LoginMemberInput): Promise<{ sessionId: string; expiresAt: Date; member: Member }> {
    const email = new Email(input.email);
    const result = await this._findByEmailForLoginQueryService.execute(email);
    if (!result) {
      throw new Error("メールアドレスが存在しません。");
    }

    const isVerified = await this._passwordVerificationDomainService.execute(input.password, result.password_hash);
    if (!isVerified) {
      throw new Error("パスワードが不正です。");
    }

    const uuid = this._uuidGenerator.execute();
    const session = await this._loginSessionGenerator.execute(uuid, result.id);

    const member = Member.create(
      new UUID(result.id),
      new Name(result.name),
      new Email(result.email),
    );

    return { sessionId: session.id, expiresAt: session.expires_at, member };
  }
}