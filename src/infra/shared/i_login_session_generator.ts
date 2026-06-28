export interface ILoginSessionGenerator {
  execute(
    uuid: string,
    memberId: string,
  ): Promise<{
    id: string;
    member_id: string;
    expires_at: Date;
  }>;
}