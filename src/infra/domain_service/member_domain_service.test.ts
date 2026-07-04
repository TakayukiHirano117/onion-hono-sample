import { describe, expect, it } from "vitest";
import type { IMemberRepository } from "../../domain/member/i_member_repository";
import { Member } from "../../domain/member/member";
import { Name } from "../../domain/member/vo/name";
import { InvariantViolationError } from "../../domain/shared/exception/domain_error";
import { Email } from "../../domain/shared/vo/email";
import { UUID } from "../../domain/shared/vo/uuid";
import { MemberDomainService } from "./member_domain_service";

class InMemoryMemberRepository implements IMemberRepository {
  constructor(private readonly members: Member[]) {}

  async findAll(): Promise<Member[]> {
    return this.members;
  }

  async findById(id: UUID): Promise<Member | null> {
    return this.members.find((member) => member.id.value === id.value) ?? null;
  }

  async findByEmail(email: Email): Promise<Member | null> {
    return this.members.find((member) => member.email.value === email.value) ?? null;
  }

  async create(member: Member): Promise<void> {
    this.members.push(member);
  }
}

const createMember = (id: string, email: string): Member =>
  Member.create(new UUID(id), new Name("test"), new Email(email));

describe("MemberDomainService", () => {
  it("同じメールアドレスの会員が存在する場合はエラーにする", async () => {
    const service = new MemberDomainService(
      new InMemoryMemberRepository([
        createMember("00000000-0000-4000-8000-000000000001", "test@example.com"),
      ]),
    );

    await expect(service.isEmailAlreadyRegistered(new Email("test@example.com"))).rejects.toThrow(
      InvariantViolationError,
    );
  });

  it("同じメールアドレスの会員が存在しない場合はエラーにしない", async () => {
    const service = new MemberDomainService(
      new InMemoryMemberRepository([
        createMember("00000000-0000-4000-8000-000000000001", "test@example.com"),
      ]),
    );

    await expect(
      service.isEmailAlreadyRegistered(new Email("other@example.com")),
    ).resolves.toBeUndefined();
  });
});
