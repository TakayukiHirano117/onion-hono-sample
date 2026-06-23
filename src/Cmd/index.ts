import { Hono, type Context } from "hono";
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

const app = new Hono().basePath("/api/v1");

// DIコンテナ作るかべつファイルにルーティングを逃してここで読み込むか
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

// health check
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
  new LoginController(loginAppService),
  new LogoutController(logoutAppService),
);

app.use("/likes", authMiddleware.handle);
app.use("/likes/*", authMiddleware.handle);

app.route("/members", memberController.setUpRoutes());
app.route("/likes", likeController.setUpRoutes());
app.route("/auth", authController.setUpRoutes());

export default app;
