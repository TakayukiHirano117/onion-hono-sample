import { Context } from "hono";
import type { IObjectStorage } from "../../application_service/shared/i_object_storage";
import { NotFoundError } from "../../application_service/shared/exception/application_error";

const ALLOWED_PREFIX = "members/";

export class GetMediaController {
  constructor(private readonly _objectStorage: IObjectStorage) {}

  async handle(c: Context) {
    const objectKey = extractObjectKey(c.req.path);
    validateObjectKey(objectKey);

    const storedObject = await this._objectStorage.get(objectKey);
    if (!storedObject) {
      throw new NotFoundError("画像が見つかりません。");
    }

    return new Response(storedObject.body, {
      headers: {
        "Content-Type": storedObject.contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}

function extractObjectKey(pathname: string): string {
  const mediaPrefix = "/api/v1/media/";
  const index = pathname.indexOf(mediaPrefix);
  if (index === -1) {
    throw new NotFoundError("画像が見つかりません。");
  }

  return decodeURIComponent(pathname.slice(index + mediaPrefix.length));
}

function validateObjectKey(objectKey: string): void {
  if (objectKey.length === 0) {
    throw new NotFoundError("画像が見つかりません。");
  }

  if (objectKey.includes("..")) {
    throw new NotFoundError("画像が見つかりません。");
  }

  if (!objectKey.startsWith(ALLOWED_PREFIX)) {
    throw new NotFoundError("画像が見つかりません。");
  }
}
