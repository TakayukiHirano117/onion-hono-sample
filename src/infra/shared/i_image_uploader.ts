export type PrepareImageUploadInput = {
  key: string;
  contentType: string;
  maxBytes: number;
  expiresInSeconds: number;
};

export type PreparedImageUpload = {
  url: string;
  fields: Record<string, string>;
};

export type ImageMetadata = {
  contentType: string | undefined;
  contentLength: number | undefined;
};

export interface IImageUploader {
  prepare(input: PrepareImageUploadInput): Promise<PreparedImageUpload>;
  head(key: string): Promise<ImageMetadata | null>;
  copy(sourceKey: string, destinationKey: string): Promise<void>;
  deleteBestEffort(key: string): Promise<void>;
}
