import { BulkString, parse, SimpleString } from "./parser";

interface Command {
  interpret(interpreter: Interpreter): string;
}

class Ping implements Command {
  interpret(_interpreter: Interpreter): string {
    return String(new SimpleString("PONG"));
  }
}

class Echo implements Command {
  message: string;

  constructor(message: BulkString) {
    this.message = String(message);
  }

  interpret(_interpreter: Interpreter): string {
    return this.message;
  }
}

class Set implements Command {
  key: string;
  value: string;

  constructor(key: BulkString, value: BulkString) {
    this.key = key.value;
    this.value = value.value;
  }

  interpret(interpreter: Interpreter): string {
    interpreter.data[this.key] = this.value;
    return String(new SimpleString("OK"));
  }
}

class Get implements Command {
  key: string;

  constructor(key: BulkString) {
    this.key = key.value;
  }

  interpret(interpreter: Interpreter): string {
    return String(new BulkString(interpreter.data[this.key]));
  }
}

const cmdStrToType: { [key: string]: any } = {
  "PING": Ping,
  "ECHO": Echo,
  "SET": Set,
  "GET": Get,
}

interface RedisDictionary {
  [key: string]: string;
}

export class Interpreter {
  data: RedisDictionary = {};

  public interpret(message: string): string {
    const root = parse(message);
    console.log("Parse tree is:", JSON.stringify(root));
    // FIXME: some commands may be more than a single word
    const cmd = root.value[0].value.toUpperCase();
    console.log("Command is:", cmd);
    if (!cmdStrToType[cmd]) {
      throw new Error(`Unknown command: ${cmd}`);
    }
    const response = new cmdStrToType[cmd](...root.value.slice(1)).interpret(this);
    console.log("Response parse tree is:", JSON.stringify(parse(response)));
    return response
  }
}
