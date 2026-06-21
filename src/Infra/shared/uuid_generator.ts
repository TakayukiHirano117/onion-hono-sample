import { uuidv7 } from "uuidv7";

export class UUIDGenerator {
  execute(): string {
    return uuidv7()
  }
}