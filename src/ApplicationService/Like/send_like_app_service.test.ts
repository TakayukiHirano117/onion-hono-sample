import { describe, expect, it } from "vitest";
import type { Transaction } from "kysely";
import { Like } from "../../Domain/Like/like";
import type { ILikeRepository } from "../../Domain/Like/i_like_repository";
import { Member } from "../../Domain/Member/member";
import type { IMemberRepository } from "../../Domain/Member/i_member_repository";
import { Name } from "../../Domain/Member/vo/name";
import { Matching } from "../../Domain/Matching/matching";
import type { IMatchingRepository } from "../../Domain/Matching/i_matching_repository";
import { Email } from "../../Domain/shared/vo/email";
import { UUID } from "../../Domain/shared/vo/uuid";
import type { Database } from "../../Infra/Database/types";
import { MatchingDomainService } from "../../Infra/DomainService/matching_domain_service";
import type { ITransactionManager } from "../../Infra/shared/i_transaction_manager";
import { UUIDGenerator } from "../../Infra/shared/uuid_generator";
import { ConflictError } from "../shared/exception/application_error";
import { SendLikeAppService } from "./send_like_app_service";

const fromMemberId = "00000000-0000-4000-8000-000000000001";
const toMemberId = "00000000-0000-4000-8000-000000000002";
const likeId = "00000000-0000-4000-8000-000000000003";
const reverseLikeId = "00000000-0000-4000-8000-000000000004";
const matchingId = "00000000-0000-4000-8000-000000000005";

class FixedUUIDGenerator extends UUIDGenerator {
  private index = 0;

  constructor(private readonly ids: string[]) {
    super();
  }

  execute(): string {
    const id = this.ids[this.index];
    this.index += 1;

    if (id === undefined) {
      throw new Error("テスト用 UUID が不足しています。");
    }

    return id;
  }
}

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

class InMemoryLikeRepository implements ILikeRepository {
  readonly createdLikes: Like[] = [];
  readonly createTransactions: unknown[] = [];

  constructor(
    private readonly likes: Like[],
    private readonly sentLikeCountThisMonth = 0,
  ) {}

  async create(like: Like, tx?: unknown): Promise<void> {
    this.createdLikes.push(like);
    this.createTransactions.push(tx);
    this.likes.push(like);
  }

  async exists(fromMemberId: UUID, toMemberId: UUID): Promise<boolean> {
    return this.likes.some(
      (like) =>
        like.fromMemberId.value === fromMemberId.value &&
        like.toMemberId.value === toMemberId.value,
    );
  }

  async findByMembers(fromMemberId: UUID, toMemberId: UUID, _tx?: unknown): Promise<Like | null> {
    return (
      this.likes.find(
        (like) =>
          like.fromMemberId.value === fromMemberId.value &&
          like.toMemberId.value === toMemberId.value,
      ) ?? null
    );
  }

  async countSentThisMonth(): Promise<number> {
    return this.sentLikeCountThisMonth;
  }
}

class InMemoryMatchingRepository implements IMatchingRepository {
  readonly createdMatchings: Matching[] = [];
  readonly createTransactions: unknown[] = [];

  async create(matching: Matching, tx?: unknown): Promise<void> {
    this.createdMatchings.push(matching);
    this.createTransactions.push(tx);
  }
}

class TestTransactionManager implements ITransactionManager {
  readonly tx = {} as Transaction<Database>;

  async runInTransaction<T>(callback: (tx: Transaction<Database>) => Promise<T>): Promise<T> {
    return callback(this.tx);
  }
}

const createMember = (id: string, name: string, email: string): Member =>
  Member.create(new UUID(id), new Name(name), new Email(email));

const createService = (likeRepository: InMemoryLikeRepository) => {
  const matchingRepository = new InMemoryMatchingRepository();
  const transactionManager = new TestTransactionManager();
  const service = new SendLikeAppService(
    likeRepository,
    new InMemoryMemberRepository([
      createMember(fromMemberId, "from member", "from@example.com"),
      createMember(toMemberId, "to member", "to@example.com"),
    ]),
    matchingRepository,
    new MatchingDomainService(),
    transactionManager,
    new FixedUUIDGenerator([likeId, matchingId]),
  );

  return { matchingRepository, service, transactionManager };
};

describe("SendLikeAppService", () => {
  it("逆向きのいいねがない場合はいいねだけを作成する", async () => {
    const likeRepository = new InMemoryLikeRepository([]);
    const { matchingRepository, service, transactionManager } = createService(likeRepository);

    await service.execute({ fromMemberId, toMemberId });

    expect(likeRepository.createdLikes).toHaveLength(1);
    expect(matchingRepository.createdMatchings).toHaveLength(0);
    expect(likeRepository.createTransactions[0]).toBe(transactionManager.tx);
  });

  it("逆向きのいいねがある場合はマッチングも作成する", async () => {
    const reverseLike = Like.create(
      new UUID(reverseLikeId),
      new UUID(toMemberId),
      new UUID(fromMemberId),
    );
    const likeRepository = new InMemoryLikeRepository([reverseLike]);
    const { matchingRepository, service, transactionManager } = createService(likeRepository);

    await service.execute({ fromMemberId, toMemberId });

    expect(likeRepository.createdLikes).toHaveLength(1);
    expect(matchingRepository.createdMatchings).toHaveLength(1);
    expect(matchingRepository.createdMatchings[0]?.member1Id.value).toBe(fromMemberId);
    expect(matchingRepository.createdMatchings[0]?.member2Id.value).toBe(toMemberId);
    expect(matchingRepository.createTransactions[0]).toBe(transactionManager.tx);
  });

  it("すでに同じ向きのいいねを送信している場合はエラーにする", async () => {
    const existingLike = Like.create(
      new UUID(reverseLikeId),
      new UUID(fromMemberId),
      new UUID(toMemberId),
    );
    const likeRepository = new InMemoryLikeRepository([existingLike]);
    const { matchingRepository, service } = createService(likeRepository);

    await expect(service.execute({ fromMemberId, toMemberId })).rejects.toThrow(ConflictError);
    expect(likeRepository.createdLikes).toHaveLength(0);
    expect(matchingRepository.createdMatchings).toHaveLength(0);
  });
});
