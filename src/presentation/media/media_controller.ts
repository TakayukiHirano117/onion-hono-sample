import { Context, Hono } from "hono";
import type { IObjectStorage } from "../../application_service/shared/i_object_storage";
import { NotFoundError } from "../../application_service/shared/exception/application_error";

const ALLOWED_KEY_PREFIX = "photos/";

export class GetMediaController {
  constructor(private readonly _objectStorage: IObjectStorage) {}

  async handle(c: Context) {
    const key = c.req.param("*") ?? "";

    if (!key.startsWith(ALLOWED_KEY_PREFIX)) {
      throw new NotFoundError("メディアが見つかりません。");
    }

    const object = await this._objectStorage.get(key);
    if (!object) {
      throw new NotFoundError("メディアが見つかりません。");
    }

    return new Response(object.body, {
      status: 200,
      headers: {
        "Content-Type": object.contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  }
}

export class MediaController {
  constructor(private readonly _getMediaController: GetMediaController) {}

  setUpRoutes = () => {
    const router = new Hono();

    router.get("/*", (c: Context) => this._getMediaController.handle(c));

    return router;
  };
}
