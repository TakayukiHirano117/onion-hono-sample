import { Email } from "../../domain/shared/vo/email";

export interface IFindByEmailForLoginQueryService {
  execute(email: Email): Promise<{
    id: string;
    email: string;
    name: string
    password_hash: string;
  } | null>;
}