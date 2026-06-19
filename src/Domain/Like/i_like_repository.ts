import { UUID } from "../shared/vo/uuid";
import { Like } from "./like";

export interface ILikeRepository {
  create(like: Like, tx?: unknown): Promise<void>;
  exists(fromMemberId: UUID, toMemberId: UUID): Promise<boolean>;
  countSentThisMonth(fromMemberId: UUID): Promise<number>;
}
