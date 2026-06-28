import { Profile } from "./profile";

export interface IProfileRepository {
  create(profile: Profile, tx?: unknown): Promise<void>;
}
