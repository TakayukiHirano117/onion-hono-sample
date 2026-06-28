import { ISessionDeleteManager } from "../../../infra/shared/i_session_delete_manager";

export class LogoutAppService {
  constructor(private readonly _sessionDeleteManager: ISessionDeleteManager) {}

  async execute(sessionId: string): Promise<void> {
    await this._sessionDeleteManager.execute(sessionId);
  }
}