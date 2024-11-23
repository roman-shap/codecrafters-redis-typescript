import { parseTokens } from "../parser";
import { RESPNode } from "./respNode";


export class Array extends RESPNode {
  firstByte = "*";

  constructor(value: RESPNode[]) {
    super(value);
    this.length = value.length;
  }

  serializeValue(): string {
    return this.value.map((node: RESPNode) => node.toString()).join("");
  }

  public static parse(tokens: string[]): [Array, number] {
    const arrayLength = Number(tokens[0].slice(1));
    let nodes = [];
    let start = 1;
    for (let i = 0; i < arrayLength; i++) {
      const [node, offset] = parseTokens(tokens.slice(start));
      nodes.push(node);
      start += offset;
    }
    return [new Array(nodes), start];
  }
}

