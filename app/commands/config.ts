import type { Config as ConfigType, Database } from "../database";
import { Array } from "../resp/array";
import { BulkString } from "../resp/bulkString";
import { Command } from "./command";


class Get extends Command {
  // FIXME: Currently supporting only single parameter, but spec supports multiple
  parameter: keyof ConfigType;

  constructor(database: Database, parameter: BulkString) {
    super(database);
    this.parameter = parameter.value;
  }

  interpret(): string {
    return String(new Array([new BulkString(this.parameter), new BulkString(this.database.config[this.parameter] || null)]));
  }
}

const subCmdToType: { [key: string]: any } = {
  "GET": Get,
}

export class Config extends Command {
  args: BulkString[];

  constructor(database: Database, ...args: BulkString[]) {
    super(database);
    this.args = args;
  }

  interpret(): string {
    const subCmd = this.args[0].value.toUpperCase();
    console.log("Subcommand is:", subCmd);
    if (!subCmdToType[subCmd]) {
      throw new Error(`Unknown subcommand: ${subCmd}`);
    }
    return new subCmdToType[subCmd](this.database, ...this.args.slice(1)).interpret();
  }
}
