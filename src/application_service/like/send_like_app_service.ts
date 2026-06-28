import { ILikeRepository } from "../../domain/like/i_like_repository";
import { Like } from "../../domain/like/like";
import { IMatchingDomainService } from "../../domain/matching/i_matching_domain_service";
import { IMatchingRepository } from "../../domain/matching/i_matching_repository";
import { Matching } from "../../domain/matching/matching";
import { IMemberRepository } from "../../domain/member/i_member_repository";
import { UUID } from "../../domain/shared/vo/uuid";
import type { ITransactionManager } from "../../infra/shared/i_transaction_manager";
import { UUIDGenerator } from "../../infra/shared/uuid_generator";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../shared/exception/application_error";

type SendLikeInput = {
  fromMemberId: string;
  toMemberId: string;
};

export class SendLikeAppService {
  constructor(
    private readonly _likeRepository: ILikeRepository,
    private readonly _memberRepository: IMemberRepository,
    private readonly _matchingRepository: IMatchingRepository,
    private readonly _matchingDomainService: IMatchingDomainService,
    private readonly _transactionManager: ITransactionManager,
    private readonly _uuidGenerator: UUIDGenerator
  ) {}

  async execute(input: SendLikeInput): Promise<void> {
    const fromMemberId = new UUID(input.fromMemberId);
    const toMemberId = new UUID(input.toMemberId);
    const like = Like.create(
      new UUID(this._uuidGenerator.execute()),
      fromMemberId,
      toMemberId,
    );

    const fromMember = await this._memberRepository.findById(fromMemberId);
    if (!fromMember) {
      throw new NotFoundError("いいね送信元の会員が存在しません。");
    }

    const toMember = await this._memberRepository.findById(toMemberId);
    if (!toMember) {
      throw new NotFoundError("いいね送信先の会員が存在しません。");
    }

    const sentLikeCountThisMonth =
      await this._likeRepository.countSentThisMonth(fromMemberId);
    if (!fromMember.canSendLike(sentLikeCountThisMonth)) {
      throw new BadRequestError("今月送信できるいいね数の上限に達しています。");
    }

    const alreadySent = await this._likeRepository.exists(
      fromMemberId,
      toMemberId,
    );
    if (alreadySent) {
      throw new ConflictError("すでにいいねを送信しています。");
    }

    await this._transactionManager.runInTransaction(async (tx) => {
      await this._likeRepository.create(like, tx);

      const receivedLike = await this._likeRepository.findByMembers(
        toMemberId,
        fromMemberId,
        tx,
      );
      if (!this._matchingDomainService.isMatched(like, receivedLike)) {
        return;
      }

      const matching = Matching.create(
        new UUID(this._uuidGenerator.execute()),
        fromMemberId,
        toMemberId,
      );
      await this._matchingRepository.create(matching, tx);
    });
  }
}
