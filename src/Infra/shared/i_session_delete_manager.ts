export interface ISessionDeleteManager {
  execute(sessionId: string): Promise<void>;
}