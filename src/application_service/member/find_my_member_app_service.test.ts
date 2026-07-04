import { describe, expect, it } from "vitest";
import { Member } from "../../domain/member/member";
import type { IMemberRepository } from "../../domain/member/i_member_repository";
import { Name } from "../../domain/member/vo/name";
import { Profile } from "../../domain/profile/profile";
import type { IProfileRepository } from "../../domain/profile/i_profile_repository";
import { Bio } from "../../domain/profile/vo/bio";
import { BirthDate } from "../../domain/profile/vo/birth_date";
import { Gender } from "../../domain/profile/vo/gender";
import { Email } from "../../domain/shared/vo/email";
import { UUID } from "../../domain/shared/vo/uuid";
import { NotFoundError } from "../shared/exception/application_error";
import { FindMyMemberAppService } from "./find_my_member_app_service";

const memberId = "00000000-0000-4000-8000-000000000001";

class InMemoryMemberRepository implements IMemberRepository {
  constructor(private readonly members: Member[]) {}

  async findAll(): Promise<Member[]> {
    return this.members;
  }

  async findById(id: UUID): Promise<Member | null> {
    return this.members.find((member) => member.id.value === id.value) ?? null;
  }

  async findByEmail(): Promise<Member | null> {
    return null;
  }

  async create(): Promise<void> {}
}

class InMemoryProfileRepository implements IProfileRepository {
  constructor(private readonly profiles: Profile[]) {}

  async create(): Promise<void> {}

  async findByMemberId(memberId: UUID): Promise<Profile | null> {
    return this.profiles.find((profile) => profile.memberId.value === memberId.value) ?? null;
  }
}

const createMember = (): Member =>
  Member.create(new UUID(memberId), new Name("test member"), new Email("test@example.com"));

const createProfile = (): Profile =>
  Profile.create(
    new UUID(memberId),
    new Bio("hello"),
    new Gender("male"),
    new BirthDate("1990/01/01"),
  );

describe("FindMyMemberAppService", () => {
  it("自分の会員とプロフィールの詳細を返す", async () => {
    const service = new FindMyMemberAppService(
      new InMemoryMemberRepository([createMember()]),
      new InMemoryProfileRepository([createProfile()]),
    );

    const result = await service.execute(memberId);

    expect(result).toEqual({
      id: memberId,
      name: "test member",
      email: "test@example.com",
      bio: "hello",
      gender: "male",
      birthDate: "1990/01/01",
    });
  });

  it("会員が存在しない場合はエラーにする", async () => {
    const service = new FindMyMemberAppService(
      new InMemoryMemberRepository([]),
      new InMemoryProfileRepository([createProfile()]),
    );

    await expect(service.execute(memberId)).rejects.toThrow(NotFoundError);
  });

  it("プロフィールが存在しない場合はエラーにする", async () => {
    const service = new FindMyMemberAppService(
      new InMemoryMemberRepository([createMember()]),
      new InMemoryProfileRepository([]),
    );

    await expect(service.execute(memberId)).rejects.toThrow(NotFoundError);
  });
});
