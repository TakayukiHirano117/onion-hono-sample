import { Hono, type Context } from "hono";
import { logger } from "hono/logger";
import type { Kysely } from "kysely";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "../application_service/shared/exception/application_error";
import { mapDomainError } from "../application_service/shared/exception/map_domain_error";
import { DomainError } from "../domain/shared/exception/domain_error";
import { MemberController } from "../presentation/member/member_controller";
import { FindAllMemberController } from "../presentation/member/find_all_member_controller";
import { FindAllMemberAppService } from "../application_service/member/find_all_member_app_service";
import { MemberRepositoryImpl } from "../infra/repository/member_repository_impl";
import { CreateMemberController } from "../presentation/member/create_member_controller";
import { CreateMemberAppService } from "../application_service/member/create_member_app_service";
import { ProfileRepositoryImpl } from "../infra/repository/profile_repository_impl";
import { TransactionManagerImpl } from "../infra/shared/transaction_manager_impl";
import { LikeRepositoryImpl } from "../infra/repository/like_repository_impl";
import { MatchingRepositoryImpl } from "../infra/repository/matching_repository_impl";
import { SendLikeAppService } from "../application_service/like/send_like_app_service";
import { LikeController } from "../presentation/like/like_controller";
import { LoginAppService } from "../application_service/auth/members/login_app_service";
import { PasswordHashGenerator } from "../infra/shared/password_hash_generator";
import { UUIDGenerator } from "../infra/shared/uuid_generator";
import { AuthController } from "../presentation/auth/auth_controller";
import { LoginController } from "../presentation/auth/members/login_controller";
import { PasswordVerificationDomainService } from "../infra/domain_service/password_verification_domain_service";
import { MatchingDomainService } from "../infra/domain_service/matching_domain_service";
import { FindByEmailForLoginQueryServiceImpl } from "../infra/query_service/find_by_email_for_login_query_service_impl";
import { LoginSessionGeneratorImpl } from "../infra/shared/login_session_generator_impl";
import { AuthMiddleware } from "./middlewares/members/auth_middeware";
import { LogoutController } from "../presentation/auth/members/logout_controller";
import { LogoutAppService } from "../application_service/auth/members/logout_app_service";
import { SessionDeleteManager } from "../infra/shared/session_delete_manager";
import type { AppConfig } from "./config/app_config";
import type { Database } from "../infra/database/types";

const STATUS_BY_CODE: Record<ApplicationErrorCode, ContentfulStatusCode> = {
  [ApplicationErrorCode.BAD_REQUEST]: 400,
  [ApplicationErrorCode.UNAUTHORIZED]: 401,
  [ApplicationErrorCode.NOT_FOUND]: 404,
  [ApplicationErrorCode.CONFLICT]: 409,
};

export function createApp(db: Kysely<Database>, appConfig: AppConfig): Hono {
  const app = new Hono().basePath("/api/v1");

  app.use("*", logger());

  const memberRepository = new MemberRepositoryImpl(db);
  const profileRepository = new ProfileRepositoryImpl(db);
  const likeRepository = new LikeRepositoryImpl(db);
  const matchingRepository = new MatchingRepositoryImpl(db);
  const transactionManager = new TransactionManagerImpl(db);
  const passwordHashGenerator = new PasswordHashGenerator();
  const passwordVerificationDomainService = new PasswordVerificationDomainService();
  const matchingDomainService = new MatchingDomainService();
  const findByEmailForLoginQueryService = new FindByEmailForLoginQueryServiceImpl(db);
  const loginSessionGenerator = new LoginSessionGeneratorImpl(db);
  const authMiddleware = new AuthMiddleware(db);
  const sessionDeleteManager = new SessionDeleteManager(db);

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
    matchingRepository,
    matchingDomainService,
    transactionManager,
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
    new LoginController(loginAppService, appConfig.auth.cookie),
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

  return app;
}
