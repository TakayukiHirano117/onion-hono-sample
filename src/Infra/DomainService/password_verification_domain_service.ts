import { IPasswordVerificationDomainService } from "../../Domain/Member/i_password_verification_domain_service";
import bcrypt from "bcryptjs";

export class PasswordVerificationDomainService implements IPasswordVerificationDomainService {
  constructor(
  ) { }

  async execute(password: string, passwordHash: string): Promise<boolean> {
    const isVerified = await bcrypt.compare(password, passwordHash);
    return !!isVerified;
  }
}