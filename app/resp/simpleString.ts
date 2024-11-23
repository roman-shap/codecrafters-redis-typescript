import { RESPNode } from "./respNode";


export class SimpleString extends RESPNode {
  firstByte = "+";

  constructor(value: string) {
    super(value);
  }

  public static parse(tokens: string[]): [SimpleString, number] {
    return [new SimpleString(tokens[0]), 1];
  }
}

