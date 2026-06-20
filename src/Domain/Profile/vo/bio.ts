import { BaseValueObject } from "../../shared/vo/base_value_object";

export type BioValue = string;
export class Bio extends BaseValueObject<BioValue> {
  static readonly MAX_BIO_LENGTH = 300;
  static readonly MIN_BIO_LENGTH = 1;

  constructor(value: BioValue) {
    super(value)
  }

  protected validate(value: BioValue): void {
    if (value.length > Bio.MAX_BIO_LENGTH) {
      throw new Error(`自己紹介の長さが不正です。(最大${Bio.MAX_BIO_LENGTH}文字)`)
    }

    if (value.length < Bio.MIN_BIO_LENGTH) {
      throw new Error(`自己紹介の長さが不正です。(最小${Bio.MIN_BIO_LENGTH}文字)`)
    }

    if (typeof value !== 'string') {
      throw new Error('自己紹介は文字列でなければなりません。')
    }
  }
}