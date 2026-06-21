import { Context } from "hono";
import { Hono } from "hono";
import { z } from "zod";
import { SendLikeAppService } from "../../ApplicationService/Like/send_like_app_service";

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
    const parseResult = sendLikeRequestSchema.safeParse(requestBody);

    if (!parseResult.success) {
      return c.json({ errors: parseResult.error.issues }, 422);
    }

    try {
      await this._sendLikeAppService.execute(parseResult.data);

      return c.json({ status: "ok" }, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }

      throw error;
    }
  }
}
