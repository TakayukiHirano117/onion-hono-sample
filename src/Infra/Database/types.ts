import type {
  ColumnType,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

export interface Database {
  members: MemberTable;
  likes: LikeTable;
  matches: MatchTable;
  profiles: ProfileTable;
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

export interface MatchTable {
  id: string;
  member1_id: string;
  member2_id: string;
  created_at: ColumnType<Date, never, never>;
}

export type MatchRow = Selectable<MatchTable>;
export type NewMatchRow = Insertable<MatchTable>;
export type MatchRowUpdate = Updateable<MatchTable>;

export interface ProfileTable {
  member_id: string;
  bio: string | null;
  gender: string | null;
  birth_date: string | null;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, never>;
}

export type ProfileRow = Selectable<ProfileTable>;
export type NewProfileRow = Insertable<ProfileTable>;
export type ProfileRowUpdate = Updateable<ProfileTable>;
