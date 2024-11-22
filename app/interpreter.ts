import { BulkString, parse, SimpleString } from "./parser";

interface Command {
  interpret(interpreter: Interpreter): string;
}

class Ping implements Command {
  interpret(interpreter: Interpreter): string {
    return new SimpleString("PONG").toString();
  }
}

class Echo implements Command {
  message: BulkString;

  constructor(message: BulkString) {
    this.message = message;
  }

  interpret(_interpreter: Interpreter): string {
    return this.message.toString();
  }
}

class Set implements Command {
  key: BulkString;
  value: BulkString;

  constructor(key: BulkString, value: BulkString) {
    this.key = key;
    this.value = value;
  }

  interpret(interpreter: Interpreter): string {
    interpreter.data[this.key.value] = this.value.value;
    return new SimpleString("OK").toString();
  }
}

class Get implements Command {
  key: BulkString;

  constructor(key: BulkString) {
    this.key = key;
  }

  interpret(interpreter: Interpreter): string {
    return new BulkString(interpreter.data[this.key.value]).toString();
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
