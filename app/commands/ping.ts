import type { Database } from "../database";
import { SimpleString } from "../resp/simpleString";
import { Command } from "./command";

export class Ping extends Command {
  constructor(database: Database) {
    super(database);
  }

  interpret(): string {
    return String(new SimpleString("PONG"));
  }
}

