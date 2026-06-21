import { Hono, type Context } from "hono";
import { MemberController } from "./Presentation/Member/member_controller";
import { FindAllMemberController } from "./Presentation/Member/find_all_member_controller";
import { FindAllMemberAppService } from "./ApplicationService/Member/find_all_member_app_service";
import { MemberRepositoryImpl } from "./Infra/Repository/member_repository_impl";
import { CreateMemberController } from "./Presentation/Member/create_member_controller";
import { CreateMemberAppService } from "./ApplicationService/Member/create_member_app_service";
import { ProfileRepositoryImpl } from "./Infra/Repository/profile_repository_impl";
import { TransactionManagerImpl } from "./Infra/shared/transaction_manager_impl";
import { LikeRepositoryImpl } from "./Infra/Repository/like_repository_impl";
import { SendLikeAppService } from "./ApplicationService/Like/send_like_app_service";
import { LikeController } from "./Presentation/Like/like_controller";
import { PasswordHashGenerator } from "./Infra/shared/password_hash_generator";
import { UUIDGenerator } from "./Infra/shared/uuid_generator";

const app = new Hono().basePath("/api/v1");

// DIコンテナ作るかべつファイルにルーティングを逃してここで読み込むか
const memberRepository = new MemberRepositoryImpl();
const profileRepository = new ProfileRepositoryImpl();
const likeRepository = new LikeRepositoryImpl();
const transactionManager = new TransactionManagerImpl();
const passwordHashGenerator = new PasswordHashGenerator();
const uuidGenerator = new UUIDGenerator();
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
);

const likeController = new LikeController(sendLikeAppService);

app.route("/members", memberController.setUpRoutes());
app.route("/likes", likeController.setUpRoutes());

export default app;
