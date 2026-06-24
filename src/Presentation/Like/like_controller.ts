import { z } from "zod";
import { Context } from "hono";
import { Hono } from "hono";
import { SendLikeAppService } from "../../ApplicationService/Like/send_like_app_service";
import { parseRequest } from "../shared/parse_request";

const sendLikeRequestSchema = z.object({
  fromMemberId: z.string(),
  toMemberId: z.string(),
});

export class LikeController {
  constructor(private readonly _sendLikeAppService: SendLikeAppService) {}

  setUpRoutes = () => {
    const router = new Hono();

    router.post("/", (c: Context) => this.handleSendLike(c));

    return router;
  };

  private async handleSendLike(c: Context) {
    const requestBody = await c.req.json();
    const input = parseRequest(sendLikeRequestSchema, requestBody);

    await this._sendLikeAppService.execute(input);

    return c.json({ status: "ok" }, 200);
  }
}
