import { UUID } from "../shared/vo/uuid";
import { Like } from "./like";

export interface ILikeRepository {
  create(like: Like, tx?: unknown): Promise<void>;
  exists(fromMemberId: UUID, toMemberId: UUID): Promise<boolean>;
  findByMembers(fromMemberId: UUID, toMemberId: UUID, tx?: unknown): Promise<Like | null>;
  countSentThisMonth(fromMemberId: UUID): Promise<number>;
}
