export abstract class RESPNode {
  abstract readonly firstByte: string;
  value: any;
  length?: number;

  constructor(value: any) {
    this.value = value;
  }

  public toString(): string {
    return `${this.firstByte}${this.serializeLength()}${this.serializeValue()}`;
  }

  protected serializeValue(): string {
    return this.value ? `${this.value}\r\n` : "";
  }

  private serializeLength(): string {
    return this.length ? `${this.length.toString()}\r\n` : "";
  }
}

