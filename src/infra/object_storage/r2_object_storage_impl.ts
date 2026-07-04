import type { IObjectStorage, StoredObject } from "../../application_service/shared/i_object_storage";

export class R2ObjectStorageImpl implements IObjectStorage {
  constructor(private readonly _bucket: R2Bucket) {}

  async put(key: string, body: Uint8Array, contentType: string): Promise<void> {
    await this._bucket.put(key, body, {
      httpMetadata: {
        contentType,
      },
    });
  }

  async get(key: string): Promise<StoredObject | null> {
    const object = await this._bucket.get(key);
    if (!object) {
      return null;
    }

    return {
      body: object.body,
      contentType: object.httpMetadata?.contentType ?? contentTypeFromKey(key),
    };
  }
}

function contentTypeFromKey(key: string): string {
  if (key.endsWith(".png")) {
    return "image/png";
  }

  if (key.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/jpeg";
}
