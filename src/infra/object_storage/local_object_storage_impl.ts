import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import type { IObjectStorage, StoredObject } from "../../application_service/shared/i_object_storage";

export class LocalObjectStorageImpl implements IObjectStorage {
  constructor(private readonly _rootDir: string) {}

  async put(key: string, body: Uint8Array, _contentType: string): Promise<void> {
    const filePath = this.resolveFilePath(key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, body);
  }

  async get(key: string): Promise<StoredObject | null> {
    const filePath = this.resolveFilePath(key);

    try {
      const buffer = await readFile(filePath);
      return {
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(buffer);
            controller.close();
          },
        }),
        contentType: contentTypeFromKey(key),
      };
    } catch {
      return null;
    }
  }

  private resolveFilePath(key: string): string {
    const normalizedKey = normalize(key).replace(/^(\.\.(\/|\\|$))+/, "");
    if (normalizedKey.startsWith("..")) {
      throw new Error("Invalid object key.");
    }

    return join(this._rootDir, normalizedKey);
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
