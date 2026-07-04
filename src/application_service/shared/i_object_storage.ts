export type StoredObject = {
  body: ReadableStream;
  contentType: string;
};

export interface IObjectStorage {
  put(key: string, body: Uint8Array, contentType: string): Promise<void>;
  get(key: string): Promise<StoredObject | null>;
}
