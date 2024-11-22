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

interface KeyTTL {
  value: number;
  unit: "seconds" | "milliseconds";
}

class Set implements Command {
  key: string;
  value: string;
  ttl?: KeyTTL;

  constructor(key: BulkString, value: BulkString, ...args: BulkString[]) {
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

  interpret(interpreter: Interpreter): string {
    interpreter.expireKey(this.key);
    const now = Date.now();
    interpreter.data[this.key] = {
      value: this.value,
      createdAt: now,
      ttl: this.ttl
    };
    console.log(`${now}: Created key ${this.key} with value ${this.value}, ttl: ${this.ttl?.value} ${this.ttl?.unit}`);
    return String(new SimpleString("OK"));
  }
}

class Get implements Command {
  key: string;

  constructor(key: BulkString) {
    this.key = key.value;
  }

  interpret(interpreter: Interpreter): string {
    interpreter.expireKey(this.key);
    return String(new BulkString(interpreter.data[this.key].value));
  }
}

const cmdStrToType: { [key: string]: any } = {
  "PING": Ping,
  "ECHO": Echo,
  "SET": Set,
  "GET": Get,
}

interface RedisDictionary {
  [key: string]: {
    value: string | null,
    createdAt: number,
    ttl?: KeyTTL
  };
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

  public expireKey(key: string): void {
    if (this.data[key] &&
      this.data[key].ttl &&
      this.data[key].ttl.unit === "milliseconds" &&
      Date.now() - this.data[key].createdAt > this.data[key].ttl.value) {
      this.data[key].value = null;
    }
  }
}
