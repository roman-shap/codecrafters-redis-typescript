import * as net from "net";
import { Interpreter } from "./interpreter";
import { Database } from "./database";

const database = new Database();
const interpreter = new Interpreter(database);

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data) => {
    const message = data.toString();
    console.log("Received message:", JSON.stringify(message));
    const response = interpreter.interpret(message);
    console.log("Response is:", response);
    connection.write(response);
  });
  connection.on("close", () => {
    console.log("Connection closed");
    connection.end();
  });
});

server.listen(6379, "127.0.0.1");
