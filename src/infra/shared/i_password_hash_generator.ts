export interface IPasswordHashGenerator {
  execute(rawPassword: string): Promise<string>;
}