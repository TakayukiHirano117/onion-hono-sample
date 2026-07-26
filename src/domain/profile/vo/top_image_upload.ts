import { TopImageMetadata, type TopImageExtension } from "./top_image_metadata";

export class TopImageUpload {
  constructor(
    readonly bytes: Uint8Array,
    readonly contentType: string,
  ) {
    new TopImageMetadata(contentType, bytes.byteLength);
  }

  extension(): TopImageExtension {
    return new TopImageMetadata(this.contentType).extension();
  }
}
