import { Hono } from "hono";
import { MemberController } from "./Presentation/Controller/member_controller";
import { FindAllMemberAppService } from "./ApplicationService/Member/find_all_member_app_service";
import { MemberRepositoryImpl } from "./Infra/Repository/member_repository_impl";
import { IMemberRepository } from "./Domain/Member/i_member_repository";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// controllerをDIしてインスタンス化したい。
const memberController = new MemberController(
  new FindAllMemberController(new FindAllMemberAppService(new MemberRepositoryImpl(new MemberRepository()))),
);
app.route("/members", memberController);

export default app;
