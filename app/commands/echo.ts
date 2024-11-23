import type { Database } from "../database";
import type { BulkString } from "../resp/bulkString";
import { Command } from "./command";

export class Echo extends Command {
  message: string;

  constructor(database: Database, message: BulkString) {
    super(database);
    this.message = String(message);
  }

  interpret(): string {
    return this.message;
  }
}

