export interface IPasswordVerificationDomainService {
  execute(passwordHash: string, password: string): Promise<boolean>;
}