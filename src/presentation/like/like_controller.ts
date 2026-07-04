import { z } from "zod";
import { Context } from "hono";
import { Hono } from "hono";
import type { AuthMiddleware } from "../../cmd/middlewares/members/auth_middeware";
import { DeleteLikeAppService } from "../../application_service/like/delete_like_app_service";
import { SendLikeAppService } from "../../application_service/like/send_like_app_service";
import { FindLikedMembersController } from "./find_liked_members_controller";
import { parseRequest } from "../shared/parse_request";

const likeRequestSchema = z.object({
  fromMemberId: z.string(),
  toMemberId: z.string(),
});

export class LikeController {
  constructor(
    private readonly _sendLikeAppService: SendLikeAppService,
    private readonly _deleteLikeAppService: DeleteLikeAppService,
    private readonly _findLikedMembersController: FindLikedMembersController,
    private readonly _authMiddleware: AuthMiddleware,
  ) {}

  setUpRoutes = () => {
    const router = new Hono();

    router.get("/", this._authMiddleware.handle, (c: Context) =>
      this._findLikedMembersController.handle(c),
    );
    router.post("/", (c: Context) => this.handleSendLike(c));
    router.delete("/", (c: Context) => this.handleDeleteLike(c));

    return router;
  };

  private async handleSendLike(c: Context) {
    const requestBody = await c.req.json();
    const input = parseRequest(likeRequestSchema, requestBody);

    await this._sendLikeAppService.execute(input);

    return c.json({ status: "ok" }, 200);
  }

  private async handleDeleteLike(c: Context) {
    const requestBody = await c.req.json();
    const input = parseRequest(likeRequestSchema, requestBody);

    await this._deleteLikeAppService.execute(input);

    return c.json({ status: "ok" }, 200);
  }
}
