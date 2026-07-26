import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import type {
  IImageUploader,
  ImageMetadata,
  PrepareImageUploadInput,
  PreparedImageUpload,
} from "./i_image_uploader";

export class S3ImageUploaderImpl implements IImageUploader {
  constructor(
    private readonly _client: S3Client,
    private readonly _bucketName: string,
  ) {}

  async prepare(input: PrepareImageUploadInput): Promise<PreparedImageUpload> {
    this.ensureBucketConfigured();

    return createPresignedPost(this._client, {
      Bucket: this._bucketName,
      Key: input.key,
      Expires: input.expiresInSeconds,
      Fields: {
        "Content-Type": input.contentType,
      },
      Conditions: [
        ["content-length-range", 1, input.maxBytes],
        { "Content-Type": input.contentType },
      ],
    });
  }

  async head(key: string): Promise<ImageMetadata | null> {
    this.ensureBucketConfigured();

    try {
      const result = await this._client.send(
        new HeadObjectCommand({
          Bucket: this._bucketName,
          Key: key,
        }),
      );
      return {
        contentType: result.ContentType,
        contentLength: result.ContentLength,
      };
    } catch (error) {
      if (error instanceof S3ServiceException && error.$metadata.httpStatusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async copy(sourceKey: string, destinationKey: string): Promise<void> {
    this.ensureBucketConfigured();

    await this._client.send(
      new CopyObjectCommand({
        Bucket: this._bucketName,
        CopySource: `${this._bucketName}/${sourceKey}`,
        Key: destinationKey,
        MetadataDirective: "COPY",
      }),
    );
  }

  private async delete(key: string): Promise<void> {
    this.ensureBucketConfigured();

    await this._client.send(
      new DeleteObjectCommand({
        Bucket: this._bucketName,
        Key: key,
      }),
    );
  }

  async deleteBestEffort(key: string): Promise<void> {
    try {
      await this.delete(key);
    } catch (error) {
      // DBは新画像を参照済み。旧画像cleanup失敗で成功レスポンスを失わせない。
      console.warn("[S3ImageUploader] best-effort delete failed", {
        key,
        error,
      });
    }
  }

  private ensureBucketConfigured(): void {
    if (!this._bucketName) {
      throw new Error("AWS_S3_BUCKET is not configured");
    }
  }
}
