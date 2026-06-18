import { uuidv7 } from "uuidv7";

export class UUIDGenerator {
  static generate(): string {
    return uuidv7()
  }
}