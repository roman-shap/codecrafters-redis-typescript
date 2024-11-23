import type { Database } from "../database";
import { BulkString } from "../parser";
import { Command } from "./command";

export class Get extends Command {
  key: string;

  constructor(database: Database, key: BulkString) {
    super(database);
    this.key = key.value;
  }

  interpret(): string {
    return String(new BulkString(this.database.get(this.key)));
  }
}

