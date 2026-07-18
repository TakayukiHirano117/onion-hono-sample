import { ILikeRepository } from "../../domain/like/i_like_repository";
import { IMemberRepository } from "../../domain/member/i_member_repository";
import { UUID } from "../../domain/shared/vo/uuid";
import { NotFoundError } from "../shared/exception/application_error";

type RequestDto = {
  fromMemberId: string;
  toMemberId: string;
};

export class DeleteLikeAppService {
  constructor(
    private readonly _likeRepository: ILikeRepository,
    private readonly _memberRepository: IMemberRepository,
  ) {}

  async execute(input: RequestDto): Promise<void> {
    const fromMemberId = new UUID(input.fromMemberId);
    const toMemberId = new UUID(input.toMemberId);

    const fromMember = await this._memberRepository.findById(fromMemberId);
    if (!fromMember) {
      throw new NotFoundError("いいね送信元の会員が存在しません。");
    }

    const toMember = await this._memberRepository.findById(toMemberId);
    if (!toMember) {
      throw new NotFoundError("いいね送信先の会員が存在しません。");
    }

    const exists = await this._likeRepository.exists(fromMemberId, toMemberId);
    if (!exists) {
      throw new NotFoundError("いいねが存在しません。");
    }

    await this._likeRepository.delete(fromMemberId, toMemberId);
  }
}
