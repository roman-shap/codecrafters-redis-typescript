import * as net from "net";
import { parse, Array } from "./parser";
import { interpret } from "./interpreter";


const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data) => {
    const message = data.toString();
    console.log("Received message:", JSON.stringify(message));
    const parseTree = parse(message);
    console.log("Parse tree is:", JSON.stringify(parseTree));
    const response = interpret(parseTree);
    console.log("Response is:", JSON.stringify(response));
    console.log("Response parse tree is:", JSON.stringify(parse(response)));
    connection.write(response);
  });
  connection.on("close", () => {
    console.log("Connection closed");
    connection.end();
  });
});

server.listen(6379, "127.0.0.1");
