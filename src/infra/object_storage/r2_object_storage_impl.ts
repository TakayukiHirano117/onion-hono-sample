import type { IObjectStorage } from "../../application_service/shared/i_object_storage";

type R2Bucket = {
  put(key: string, value: ArrayBuffer | Uint8Array, options?: { httpMetadata?: { contentType?: string } }): Promise<void>;
  get(key: string): Promise<{ body: ReadableStream<Uint8Array> | null; httpMetadata?: { contentType?: string } } | null>;
  delete(key: string): Promise<void>;
};

export class R2ObjectStorageImpl implements IObjectStorage {
  constructor(private readonly _bucket: R2Bucket) {}

  async put(key: string, body: Uint8Array, contentType: string): Promise<void> {
    await this._bucket.put(key, body, {
      httpMetadata: { contentType },
    });
  }

  async get(key: string): Promise<{ body: Uint8Array; contentType: string } | null> {
    const object = await this._bucket.get(key);

    if (!object?.body) {
      return null;
    }

    const body = new Uint8Array(await new Response(object.body).arrayBuffer());
    return {
      body,
      contentType: object.httpMetadata?.contentType ?? "application/octet-stream",
    };
  }

  async delete(key: string): Promise<void> {
    await this._bucket.delete(key);
  }
}
