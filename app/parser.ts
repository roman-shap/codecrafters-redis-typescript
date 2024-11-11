export abstract class RESPNode {
  abstract readonly firstByte: string;
  value: any;
  length?: number;

  constructor(value: any) {
    this.value = value;
  }

  public serialize(): string {
    return `${this.firstByte}${this.serializeLength()}${this.serializeValue()}`;
  }

  protected serializeValue(): string {
    return `${this.value}\r\n`;
  }

  private serializeLength(): string {
    return this.length ? `${this.length.toString()}\r\n` : "";
  }
}

export class SimpleString extends RESPNode {
  firstByte = "+";

  constructor(value: string) {
    super(value);
  }

  public static parse(tokens: string[]): [SimpleString, number] {
    return [new SimpleString(tokens[0]), 1];
  }
}

export class BulkString extends RESPNode {
  firstByte = "$";

  constructor(value: string) {
    super(value);
    this.length = value.length;
  }

  public static parse(tokens: string[]): [BulkString, number] {
    this.validateBulkStringTokens(tokens);
    return [new BulkString(tokens[1]), 2];
  }

  private static validateBulkStringTokens(tokens: string[]): void {
    if (tokens.length < 2 || Number(tokens[0].slice(1)) != tokens[1].length) {
      throw new Error("Invalid BulkString");
    }
  }
}

export class Array extends RESPNode {
  firstByte = "*";

  constructor(value: RESPNode[]) {
    super(value);
    this.length = value.length;
  }

  serializeValue(): string {
    return this.value.map((node: RESPNode) => node.serialize()).join("");
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

function parseTokens(tokens: string[]): [RESPNode, number] {
  const firstByte = tokens[0][0];
  if (!(firstByte in symbolToRESPType)) {
    throw new Error(`Unknown first byte: ${firstByte}`);
  }
  return symbolToRESPType[firstByte].parse(tokens);
}
