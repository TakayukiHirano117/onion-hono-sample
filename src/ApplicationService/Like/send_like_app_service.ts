import { ILikeRepository } from "../../Domain/Like/i_like_repository";
import { Like } from "../../Domain/Like/like";
import { IMemberRepository } from "../../Domain/Member/i_member_repository";
import { UUID } from "../../Domain/shared/vo/uuid";
import { UUIDGenerator } from "../../Infra/shared/uuid_generator";

type SendLikeInput = {
  fromMemberId: string;
  toMemberId: string;
};

export class SendLikeAppService {
  constructor(
    private readonly _likeRepository: ILikeRepository,
    private readonly _memberRepository: IMemberRepository,
  ) {}

  async execute(input: SendLikeInput): Promise<void> {
    const fromMemberId = new UUID(input.fromMemberId);
    const toMemberId = new UUID(input.toMemberId);
    const like = Like.create(
      new UUID(UUIDGenerator.generate()),
      fromMemberId,
      toMemberId,
    );

    const fromMember = await this._memberRepository.findById(fromMemberId);
    if (!fromMember) {
      throw new Error("いいね送信元の会員が存在しません。");
    }

    const toMember = await this._memberRepository.findById(toMemberId);
    if (!toMember) {
      throw new Error("いいね送信先の会員が存在しません。");
    }

    const sentLikeCountThisMonth =
      await this._likeRepository.countSentThisMonth(fromMemberId);
    if (!fromMember.canSendLike(sentLikeCountThisMonth)) {
      throw new Error("今月送信できるいいね数の上限に達しています。");
    }

    const alreadySent = await this._likeRepository.exists(
      fromMemberId,
      toMemberId,
    );
    if (alreadySent) {
      throw new Error("すでにいいねを送信しています。");
    }

    await this._likeRepository.create(like);
  }
}
