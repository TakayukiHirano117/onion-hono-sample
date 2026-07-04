import { Email } from "../shared/vo/email";

export interface IMemberDomainService {
  isEmailAlreadyRegistered(email: Email): Promise<void>;
}
