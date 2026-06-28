import { Matching } from "./matching";

export interface IMatchingRepository {
  create(matching: Matching, tx?: unknown): Promise<void>;
}
