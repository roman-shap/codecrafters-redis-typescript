import { RESPNode } from "./respNode";


export class BulkString extends RESPNode {
  firstByte = "$";

  constructor(value: string | null) {
    super(value);
    this.length = value ? value.length : -1;
  }

  public static parse(tokens: string[]): [BulkString, number] {
    this.validateBulkStringTokens(tokens);
    return [new BulkString(tokens[1]), 2];
  }

  private static validateBulkStringTokens(tokens: string[]): void {
    if (!((tokens.length === 1 && tokens[0] === "$-1") ||
      (tokens.length >= 2 && Number(tokens[0].slice(1)) === tokens[1].length))) {
      throw new Error("Invalid BulkString");
    }
  }
}

