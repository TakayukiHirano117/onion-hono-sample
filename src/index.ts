import { Hono } from "hono";
import { MemberController } from "./Presentation/Member/member_controller";
import { FindAllMemberController } from "./Presentation/Member/find_all_member_controller";
import { FindAllMemberAppService } from "./ApplicationService/Member/find_all_member_app_service";
import { MemberRepositoryImpl } from "./Infra/Repository/member_repository_impl";
import { CreateMemberController } from "./Presentation/Member/create_member_controller";
import { CreateMemberAppService } from "./ApplicationService/Member/create_member_app_service";
import { ProfileRepositoryImpl } from "./Infra/Repository/profile_repository_impl";
import { TransactionManagerImpl } from "./Infra/shared/transaction_manager_impl";

const app = new Hono();

// DIコンテナ作るかべつファイルにルーティングを逃してここで読み込むか
const memberRepository = new MemberRepositoryImpl();
const profileRepository = new ProfileRepositoryImpl();
const transactionManager = new TransactionManagerImpl();
const findAllMemberAppService = new FindAllMemberAppService(memberRepository);
const createMemberAppService = new CreateMemberAppService(
  memberRepository,
  profileRepository,
  transactionManager,
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const memberController = new MemberController(
  new FindAllMemberController(findAllMemberAppService),
  new CreateMemberController(createMemberAppService),
);

app.route("/members", memberController.setUpRoutes());

export default app;
