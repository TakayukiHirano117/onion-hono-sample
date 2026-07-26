import { BadRequestError } from "../../application_service/shared/exception/application_error";

export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new BadRequestError("JSONの形式が不正です。");
  }
}
