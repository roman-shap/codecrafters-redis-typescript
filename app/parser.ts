import type { RESPNode } from "./resp/respNode";
import { Array } from "./resp/array";
import { BulkString } from "./resp/bulkString";
import { SimpleString } from "./resp/simpleString";

function tokenize(input: string): string[] {
  let tokens = input.split("\r\n");
  tokens.splice(-1);
  console.log("Tokens are:", tokens);
  return tokens;
}

const symbolToRESPType: { [key: string]: any } = {
  "+": SimpleString,
  "$": BulkString,
  "*": Array
}

export function parse(message: string): Array {
  const tokens = tokenize(message);
  const [node, _] = parseTokens(tokens);
  return node as Array;
}

export function parseTokens(tokens: string[]): [RESPNode, number] {
  const firstByte = tokens[0][0];
  if (!(firstByte in symbolToRESPType)) {
    throw new Error(`Unknown first byte: ${firstByte}`);
  }
  return symbolToRESPType[firstByte].parse(tokens);
}
