import { Profile } from "./profile";
import { UUID } from "../shared/vo/uuid";

export interface IProfileRepository {
  create(profile: Profile, tx?: unknown): Promise<void>;
  findByMemberId(memberId: UUID): Promise<Profile | null>;
}
