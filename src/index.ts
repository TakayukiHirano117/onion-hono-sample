import { Hono } from "hono";
import { MemberController } from "./Presentation/Member/member_controller";
import { FindAllMemberController } from "./Presentation/Member/find_all_member_controller";
import { FindAllMemberAppService } from "./ApplicationService/Member/find_all_member_app_service";
import { MemberRepositoryImpl } from "./Infra/Repository/member_repository_impl";

const app = new Hono();

const memberRepository = new MemberRepositoryImpl();
const findAllMemberAppService = new FindAllMemberAppService(memberRepository);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const memberController = new MemberController(
  new FindAllMemberController(findAllMemberAppService),
);

app.route("/members", memberController.setUpRoutes());

export default app;
