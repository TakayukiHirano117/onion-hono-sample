import { Profile } from "./profile";
import { UUID } from "../shared/vo/uuid";
import type { TopImagePath } from "./vo/top_image_path";

export interface IProfileRepository {
  create(profile: Profile, tx?: unknown): Promise<void>;
  findByMemberId(memberId: UUID): Promise<Profile | null>;
  updateTopImagePath(memberId: UUID, topImagePath: TopImagePath | null, tx?: unknown): Promise<void>;
}
