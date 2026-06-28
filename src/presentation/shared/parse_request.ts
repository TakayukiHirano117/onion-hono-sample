import type { ZodType } from "zod";
import { BadRequestError } from "../../application_service/shared/exception/application_error";

export function parseRequest<T>(schema: ZodType<T>, data: unknown): T {
  const parseResult = schema.safeParse(data);
  if (!parseResult.success) {
    throw new BadRequestError("リクエストの形式が不正です。", parseResult.error.issues);
  }
  return parseResult.data;
}
