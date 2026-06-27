import { Hono, type Context } from "hono";
import { logger } from "hono/logger";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "../ApplicationService/shared/exception/application_error";
import { mapDomainError } from "../ApplicationService/shared/exception/map_domain_error";
import { DomainError } from "../Domain/shared/exception/domain_error";
import { MemberController } from "../Presentation/Member/member_controller";
import { FindAllMemberController } from "../Presentation/Member/find_all_member_controller";
import { FindAllMemberAppService } from "../ApplicationService/Member/find_all_member_app_service";
import { MemberRepositoryImpl } from "../Infra/Repository/member_repository_impl";
import { CreateMemberController } from "../Presentation/Member/create_member_controller";
import { CreateMemberAppService } from "../ApplicationService/Member/create_member_app_service";
import { ProfileRepositoryImpl } from "../Infra/Repository/profile_repository_impl";
import { TransactionManagerImpl } from "../Infra/shared/transaction_manager_impl";
import { LikeRepositoryImpl } from "../Infra/Repository/like_repository_impl";
import { SendLikeAppService } from "../ApplicationService/Like/send_like_app_service";
import { LikeController } from "../Presentation/Like/like_controller";
import { LoginAppService } from "../ApplicationService/Auth/members/login_app_service";
import { PasswordHashGenerator } from "../Infra/shared/password_hash_generator";
import { UUIDGenerator } from "../Infra/shared/uuid_generator";
import { AuthController } from "../Presentation/auth/auth_controller";
import { LoginController } from "../Presentation/auth/members/login_controller";
import { PasswordVerificationDomainService } from "../Infra/DomainService/password_verification_domain_service";
import { FindByEmailForLoginQueryServiceImpl } from "../Infra/QueryService/find_by_email_for_login_query_service_impl";
import { LoginSessionGeneratorImpl } from "../Infra/shared/login_session_generator_impl";
import { AuthMiddleware } from "./middlewares/members/auth_middeware";
import { LogoutController } from "../Presentation/auth/members/logout_controller";
import { LogoutAppService } from "../ApplicationService/Auth/members/logout_app_service";
import { SessionDeleteManager } from "../Infra/shared/session_delete_manager";
import { config } from "./config";

const STATUS_BY_CODE: Record<ApplicationErrorCode, ContentfulStatusCode> = {
  [ApplicationErrorCode.BAD_REQUEST]: 400,
  [ApplicationErrorCode.UNAUTHORIZED]: 401,
  [ApplicationErrorCode.NOT_FOUND]: 404,
  [ApplicationErrorCode.CONFLICT]: 409,
};

const app = new Hono().basePath("/api/v1");

app.use("*", logger());

const memberRepository = new MemberRepositoryImpl();
const profileRepository = new ProfileRepositoryImpl();
const likeRepository = new LikeRepositoryImpl();
const transactionManager = new TransactionManagerImpl();
const passwordHashGenerator = new PasswordHashGenerator();
const passwordVerificationDomainService = new PasswordVerificationDomainService();
const findByEmailForLoginQueryService = new FindByEmailForLoginQueryServiceImpl();
const loginSessionGenerator = new LoginSessionGeneratorImpl();
const authMiddleware = new AuthMiddleware();
const sessionDeleteManager = new SessionDeleteManager();

const uuidGenerator = new UUIDGenerator();
const loginAppService = new LoginAppService(
  passwordVerificationDomainService,
  findByEmailForLoginQueryService,
  uuidGenerator,
  loginSessionGenerator,
);
const logoutAppService = new LogoutAppService(sessionDeleteManager);
const findAllMemberAppService = new FindAllMemberAppService(memberRepository);
const createMemberAppService = new CreateMemberAppService(
  memberRepository,
  profileRepository,
  transactionManager,
  passwordHashGenerator,
  uuidGenerator,
);
const sendLikeAppService = new SendLikeAppService(
  likeRepository,
  memberRepository,
  uuidGenerator,
);

app.get("/", (c: Context) => {
  return c.text("Hello Hono!");
});

const memberController = new MemberController(
  new FindAllMemberController(findAllMemberAppService),
  new CreateMemberController(createMemberAppService),
  authMiddleware,
);

const likeController = new LikeController(sendLikeAppService);

const authController = new AuthController(
  new LoginController(loginAppService, config.auth.cookie),
  new LogoutController(logoutAppService),
);

app.use("/likes", authMiddleware.handle);
app.use("/likes/*", authMiddleware.handle);

app.route("/members", memberController.setUpRoutes());
app.route("/likes", likeController.setUpRoutes());
app.route("/auth", authController.setUpRoutes());

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: ApplicationErrorCode.NOT_FOUND,
      message: "リソースが見つかりません。",
    },
    404,
  );
});

app.onError((err, c) => {
  const applicationError =
    err instanceof ApplicationError
      ? err
      : err instanceof DomainError
        ? mapDomainError(err)
        : null;

  if (applicationError) {
    console.warn("[ApplicationError]", {
      method: c.req.method,
      path: c.req.path,
      code: applicationError.code,
      message: applicationError.message,
    });

    return c.json(
      {
        success: false,
        error: applicationError.code,
        message: applicationError.message,
        ...(applicationError.details !== undefined ? { details: applicationError.details } : {}),
      },
      STATUS_BY_CODE[applicationError.code],
    );
  }

  console.error("[Unhandled]", {
    method: c.req.method,
    path: c.req.path,
    error: err,
  });

  return c.json(
    {
      success: false,
      error: "InternalServerError",
      message: "予期せぬエラーが発生しました。時間をおいて再度お試しください。",
    },
    500,
  );
});

export default app;
