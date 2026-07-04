import { describe, expect, it } from "vitest";
import { Like } from "../../domain/like/like";
import type { ILikeRepository } from "../../domain/like/i_like_repository";
import { Member } from "../../domain/member/member";
import type { IMemberRepository } from "../../domain/member/i_member_repository";
import { Name } from "../../domain/member/vo/name";
import { Email } from "../../domain/shared/vo/email";
import { UUID } from "../../domain/shared/vo/uuid";
import { NotFoundError } from "../shared/exception/application_error";
import { DeleteLikeAppService } from "./delete_like_app_service";

const fromMemberId = "00000000-0000-4000-8000-000000000001";
const toMemberId = "00000000-0000-4000-8000-000000000002";
const likeId = "00000000-0000-4000-8000-000000000003";

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

class InMemoryLikeRepository implements ILikeRepository {
  constructor(private readonly likes: Like[]) {}

  readonly deletedPairs: { fromMemberId: UUID; toMemberId: UUID }[] = [];

  async create(): Promise<void> {}

  async delete(fromMemberId: UUID, toMemberId: UUID): Promise<void> {
    this.deletedPairs.push({ fromMemberId, toMemberId });
    const index = this.likes.findIndex(
      (like) =>
        like.fromMemberId.value === fromMemberId.value &&
        like.toMemberId.value === toMemberId.value,
    );
    if (index !== -1) {
      this.likes.splice(index, 1);
    }
  }

  async exists(fromMemberId: UUID, toMemberId: UUID): Promise<boolean> {
    return this.likes.some(
      (like) =>
        like.fromMemberId.value === fromMemberId.value &&
        like.toMemberId.value === toMemberId.value,
    );
  }

  async findByMembers(): Promise<Like | null> {
    return null;
  }

  async countSentThisMonth(): Promise<number> {
    return 0;
  }
}

const createMember = (id: string, name: string, email: string): Member =>
  Member.create(new UUID(id), new Name(name), new Email(email));

const createService = (likeRepository: InMemoryLikeRepository) =>
  new DeleteLikeAppService(
    likeRepository,
    new InMemoryMemberRepository([
      createMember(fromMemberId, "from member", "from@example.com"),
      createMember(toMemberId, "to member", "to@example.com"),
    ]),
  );

describe("DeleteLikeAppService", () => {
  it("いいねを削除する", async () => {
    const existingLike = Like.create(
      new UUID(likeId),
      new UUID(fromMemberId),
      new UUID(toMemberId),
    );
    const likeRepository = new InMemoryLikeRepository([existingLike]);
    const service = createService(likeRepository);

    await service.execute({ fromMemberId, toMemberId });

    expect(likeRepository.deletedPairs).toHaveLength(1);
    expect(likeRepository.deletedPairs[0]?.fromMemberId.value).toBe(fromMemberId);
    expect(likeRepository.deletedPairs[0]?.toMemberId.value).toBe(toMemberId);
    expect(await likeRepository.exists(new UUID(fromMemberId), new UUID(toMemberId))).toBe(
      false,
    );
  });

  it("いいねが存在しない場合はエラーにする", async () => {
    const likeRepository = new InMemoryLikeRepository([]);
    const service = createService(likeRepository);

    await expect(service.execute({ fromMemberId, toMemberId })).rejects.toThrow(NotFoundError);
    expect(likeRepository.deletedPairs).toHaveLength(0);
  });

  it("送信元会員が存在しない場合はエラーにする", async () => {
    const existingLike = Like.create(
      new UUID(likeId),
      new UUID(fromMemberId),
      new UUID(toMemberId),
    );
    const likeRepository = new InMemoryLikeRepository([existingLike]);
    const service = new DeleteLikeAppService(
      likeRepository,
      new InMemoryMemberRepository([createMember(toMemberId, "to member", "to@example.com")]),
    );

    await expect(service.execute({ fromMemberId, toMemberId })).rejects.toThrow(NotFoundError);
  });

  it("送信先会員が存在しない場合はエラーにする", async () => {
    const existingLike = Like.create(
      new UUID(likeId),
      new UUID(fromMemberId),
      new UUID(toMemberId),
    );
    const likeRepository = new InMemoryLikeRepository([existingLike]);
    const service = new DeleteLikeAppService(
      likeRepository,
      new InMemoryMemberRepository([createMember(fromMemberId, "from member", "from@example.com")]),
    );

    await expect(service.execute({ fromMemberId, toMemberId })).rejects.toThrow(NotFoundError);
  });
});
