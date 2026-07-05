import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { IObjectStorage } from "../../application_service/shared/i_object_storage";

export class LocalObjectStorageImpl implements IObjectStorage {
  constructor(private readonly _rootDir: string) {}

  async put(key: string, body: Uint8Array, _contentType: string): Promise<void> {
    const filePath = this.resolvePath(key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, body);
  }

  async get(key: string): Promise<{ body: Uint8Array; contentType: string } | null> {
    const filePath = this.resolvePath(key);

    try {
      const body = await readFile(filePath);
      return {
        body: new Uint8Array(body),
        contentType: this.inferContentType(key),
      };
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);

    try {
      await rm(filePath, { force: true });
    } catch {
      // ignore missing files
    }
  }

  private resolvePath(key: string): string {
    const normalized = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, "");
    return path.join(this._rootDir, normalized);
  }

  private inferContentType(key: string): string {
    if (key.endsWith(".png")) {
      return "image/png";
    }

    if (key.endsWith(".webp")) {
      return "image/webp";
    }

    return "image/jpeg";
  }
}
