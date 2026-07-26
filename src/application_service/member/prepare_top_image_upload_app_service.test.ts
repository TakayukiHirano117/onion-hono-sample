import { describe, expect, it, vi } from "vitest";
import type {
  IImageUploader,
  ImageMetadata,
  PrepareImageUploadInput,
  PreparedImageUpload,
} from "../../infra/shared/i_image_uploader";
import { PrepareTopImageUploadAppService } from "./prepare_top_image_upload_app_service";

const memberId = "00000000-0000-4000-8000-000000000001";
const uploadId = "00000000-0000-4000-8000-000000000002";

class StubImageUploader implements IImageUploader {
  readonly prepare = vi.fn(
    async (_input: PrepareImageUploadInput): Promise<PreparedImageUpload> => ({
      url: "https://bucket.s3.example.com",
      fields: { key: "signed-key", policy: "signed-policy" },
    }),
  );

  async head(_key: string): Promise<ImageMetadata | null> {
    return null;
  }

  async copy(_sourceKey: string, _destinationKey: string): Promise<void> {}

  async deleteBestEffort(_key: string): Promise<void> {}
}

describe("PrepareTopImageUploadAppService", () => {
  it("会員専用の一時キーで5MB以下の署名付きPOSTを発行する", async () => {
    const uploader = new StubImageUploader();
    const service = new PrepareTopImageUploadAppService(uploader, { execute: () => uploadId }, 300);

    const result = await service.execute({
      viewerMemberId: memberId,
      contentType: "image/jpeg",
    });

    expect(uploader.prepare).toHaveBeenCalledWith({
      key: `pending/${memberId}/${uploadId}.jpg`,
      contentType: "image/jpeg",
      maxBytes: 5 * 1024 * 1024,
      expiresInSeconds: 300,
    });
    expect(result).toEqual({
      url: "https://bucket.s3.example.com",
      fields: { key: "signed-key", policy: "signed-policy" },
      uploadId,
    });
  });

  it("許可されていないMIMEを拒否する", async () => {
    const service = new PrepareTopImageUploadAppService(
      new StubImageUploader(),
      { execute: () => uploadId },
      300,
    );

    await expect(
      service.execute({
        viewerMemberId: memberId,
        contentType: "image/gif",
      }),
    ).rejects.toThrow("トップ画像の形式が不正です。");
  });
});
