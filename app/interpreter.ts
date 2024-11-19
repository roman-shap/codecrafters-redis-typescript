import { BulkString, parse, SimpleString } from "./parser";

interface Command {
  interpret(interpreter: Interpreter, ...args: BulkString[]): string;
}

class Ping implements Command {
  interpret(interpreter: Interpreter): string {
    return new SimpleString("PONG").serialize();
  }
}

class Echo implements Command {
  interpret(_interpreter: Interpreter, value: BulkString): string {
    return value.serialize();
  }
}

const cmdStrToType: { [key: string]: any } = {
  "PING": Ping,
  "ECHO": Echo
}

export class Interpreter {

  constructor() { }

  public interpret(message: string): string {
    const root = parse(message);
    console.log("Parse tree is:", JSON.stringify(root));
    // FIXME: some commands may be more than a single word
    const cmd = root.value[0].value.toUpperCase();
    console.log("Command is:", cmd);
    if (!cmdStrToType[cmd]) {
      throw new Error(`Unknown command: ${cmd}`);
    }
    const response = new cmdStrToType[cmd]().interpret(this, ...root.value.slice(1));
    console.log("Response parse tree is:", JSON.stringify(parse(response)));
    return response
  }
}
