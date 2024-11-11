import { Array, BulkString, SimpleString } from "./parser";

interface Command {
  interpret(...args: BulkString[]): string;
}

class Ping implements Command {
  interpret(): string {
    return new SimpleString("PONG").serialize();
  }
}

class Echo implements Command {
  interpret(value: BulkString): string {
    return value.serialize();
  }
}

const cmdStrToType: { [key: string]: any } = {
  "PING": Ping,
  "ECHO": Echo
}

export function interpret(root: Array): string {
  // FIXME: some commands may be more than a single word
  const cmd = root.value[0].value.toUpperCase();
  console.log("Command is:", cmd);
  if (!cmdStrToType[cmd]) {
    throw new Error(`Unknown command: ${cmd}`);
  }
  return new cmdStrToType[cmd]().interpret(...root.value.slice(1));
}

