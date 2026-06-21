import { IPasswordHashGenerator } from "./i_password_hash_generator";
import bcrypt from "bcrypt";

export class PasswordHashGenerator implements IPasswordHashGenerator {
  async execute(rawPassword: string): Promise<string> {
    return await bcrypt.hash(rawPassword, 10);
  }
}