import { parse } from "./parser";
import { Echo } from "./commands/echo";
import { Get } from "./commands/get";
import { Ping } from "./commands/ping";
import { Set } from "./commands/set";
import { Config } from "./commands/config";
import type { Database } from "./database";

const cmdStrToType: { [key: string]: any } = {
  "PING": Ping,
  "ECHO": Echo,
  "SET": Set,
  "GET": Get,
  "CONFIG": Config,
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
