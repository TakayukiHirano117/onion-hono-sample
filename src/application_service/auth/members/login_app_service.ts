import { IPasswordVerificationDomainService } from "../../../domain/member/i_password_verification_domain_service";
import { Name } from "../../../domain/member/vo/name";
import { Member } from "../../../domain/member/member";
import { Email } from "../../../domain/shared/vo/email";
import { UUID } from "../../../domain/shared/vo/uuid";
import { ILoginSessionGenerator } from "../../../infra/shared/i_login_session_generator";
import { UUIDGenerator } from "../../../infra/shared/uuid_generator";
import { IFindByEmailForLoginQueryService } from "../../../application_service/member/i_find_by_email_for_login_query_service";
import { UnauthorizedError } from "../../shared/exception/application_error";

type LoginInput = {
  email: string;
  password: string;
};

export class LoginAppService {
  constructor(
    private readonly _passwordVerificationDomainService: IPasswordVerificationDomainService,
    private readonly _findByEmailForLoginQueryService: IFindByEmailForLoginQueryService,
    private readonly _uuidGenerator: UUIDGenerator,
    private readonly _loginSessionGenerator: ILoginSessionGenerator
  ) { }

  async execute(input: LoginInput): Promise<{ sessionId: string; expiresAt: Date; member: Member }> {
    const email = new Email(input.email);
    const result = await this._findByEmailForLoginQueryService.execute(email);
    if (!result) {
      throw new UnauthorizedError("メールアドレスが正しくありません。");
    }

    const isVerified = await this._passwordVerificationDomainService.execute(input.password, result.password_hash);
    if (!isVerified) {
      throw new UnauthorizedError("パスワードが正しくありません。");
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
