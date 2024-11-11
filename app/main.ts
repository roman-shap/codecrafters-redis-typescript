import * as net from "net";


const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data) => {
    const message = data.toString();
    console.log("Received message:", JSON.stringify(message));
    const response = `+PONG\r\n`;
    console.log("Response is:", JSON.stringify(response));
    connection.write(response);
  });
  connection.on("close", () => {
    console.log("Connection closed");
    connection.end();
  });
});

server.listen(6379, "127.0.0.1");
