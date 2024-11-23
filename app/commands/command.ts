import type { Database } from "../database";

export abstract class Command {
  database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  abstract interpret(): string;
}

