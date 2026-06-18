import type {
  ColumnType,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  members: MemberTable;
  likes: LikeTable;
}

export interface MemberTable {
  id: string;
  name: string;
  email: string;
}

export type MemberRow = Selectable<MemberTable>;
export type NewMemberRow = Insertable<MemberTable>;
export type MemberRowUpdate = Updateable<MemberTable>;

export interface LikeTable {
  id: string;
  from_member_id: string;
  to_member_id: string;
  created_at: ColumnType<Date, never, never>;
}

export type LikeRow = Selectable<LikeTable>;
export type NewLikeRow = Insertable<LikeTable>;
export type LikeRowUpdate = Updateable<LikeTable>;
