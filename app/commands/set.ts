import type { KeyTTL, Database } from "../database";
import { BulkString, SimpleString } from "../parser";
import { Command } from "./command";

export class Set extends Command {
  key: string;
  value: string;
  ttl?: KeyTTL;

  constructor(database: Database, key: BulkString, value: BulkString, ...args: BulkString[]) {
    super(database);
    this.key = key.value;
    this.value = value.value;
    this.parseExpiry(...args);
  }

  private parseExpiry(...args: BulkString[]): void {
    const pxIdx = args.findIndex((arg) => arg.value.toUpperCase() === "PX");
    if (pxIdx !== -1) {
      this.ttl = { value: Number(args[pxIdx + 1].value), unit: "milliseconds" };
    }
  }

  interpret(): string {
    this.database.set(this.key, this.value, this.ttl);
    return String(new SimpleString("OK"));
  }
}

