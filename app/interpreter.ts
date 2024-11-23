import type { KeyTTL, Database } from "./database";
import { BulkString, parse, SimpleString } from "./parser";

abstract class Command {
  database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  abstract interpret(): string;
}

class Ping extends Command {
  constructor(database: Database) {
    super(database);
  }

  interpret(): string {
    return String(new SimpleString("PONG"));
  }
}

class Echo extends Command {
  message: string;

  constructor(database: Database, message: BulkString) {
    super(database);
    this.message = String(message);
  }

  interpret(): string {
    return this.message;
  }
}

class Set extends Command {
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

class Get extends Command {
  key: string;

  constructor(database: Database, key: BulkString) {
    super(database);
    this.key = key.value;
  }

  interpret(): string {
    return String(new BulkString(this.database.get(this.key)));
  }
}

const cmdStrToType: { [key: string]: any } = {
  "PING": Ping,
  "ECHO": Echo,
  "SET": Set,
  "GET": Get,
}

export class Interpreter {
  database: Database;

  constructor(database: Database) {
    this.database = database
  }

  public interpret(message: string): string {
    const root = parse(message);
    console.log("Parse tree is:", JSON.stringify(root));
    // FIXME: some commands may be more than a single word
    const cmd = root.value[0].value.toUpperCase();
    console.log("Command is:", cmd);
    if (!cmdStrToType[cmd]) {
      throw new Error(`Unknown command: ${cmd}`);
    }
    const response = new cmdStrToType[cmd](this.database, ...root.value.slice(1)).interpret();
    console.log("Response parse tree is:", JSON.stringify(parse(response)));
    return response
  }

}
