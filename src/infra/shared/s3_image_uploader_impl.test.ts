import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { S3ImageUploaderImpl } from "./s3_image_uploader_impl";

vi.mock("@aws-sdk/s3-presigned-post", () => ({
  createPresignedPost: vi.fn(),
}));

describe("S3ImageUploaderImpl", () => {
  const client = new S3Client({ region: "ap-northeast-1" });
  const send = vi.spyOn(client, "send");
  const uploader = new S3ImageUploaderImpl(client, "photo-bucket");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("MIMEとサイズを固定した短期署名付きPOSTを生成する", async () => {
    vi.mocked(createPresignedPost).mockResolvedValue({
      url: "https://photo-bucket.s3.example.com",
      fields: { key: "pending/key.jpg", policy: "policy" },
    });

    const result = await uploader.prepare({
      key: "pending/key.jpg",
      contentType: "image/jpeg",
      maxBytes: 5 * 1024 * 1024,
      expiresInSeconds: 300,
    });

    expect(createPresignedPost).toHaveBeenCalledWith(client, {
      Bucket: "photo-bucket",
      Key: "pending/key.jpg",
      Expires: 300,
      Fields: { "Content-Type": "image/jpeg" },
      Conditions: [["content-length-range", 1, 5 * 1024 * 1024], { "Content-Type": "image/jpeg" }],
    });
    expect(result.url).toBe("https://photo-bucket.s3.example.com");
  });

  it("CopyObjectを送信する", async () => {
    send.mockResolvedValue();

    await uploader.copy("pending/key.webp", "photos/key.webp");

    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(CopyObjectCommand);
  });

  it("HeadObjectが404なら未アップロードとして扱う", async () => {
    send.mockRejectedValueOnce(
      new S3ServiceException({
        name: "NotFound",
        $fault: "client",
        $metadata: { httpStatusCode: 404 },
      }),
    );

    await expect(uploader.head("pending/missing.jpg")).resolves.toBeNull();
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(HeadObjectCommand);
  });

  it("旧画像の削除失敗を記録してbest-effort cleanupを成功扱いにする", async () => {
    const deleteError = new Error("delete failed");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    send.mockRejectedValueOnce(deleteError);

    await expect(uploader.deleteBestEffort("photos/member/old.jpg")).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith("[S3ImageUploader] best-effort delete failed", {
      key: "photos/member/old.jpg",
      error: deleteError,
    });
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(DeleteObjectCommand);
    warn.mockRestore();
  });
});
