import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true
  }
})
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage("chat:join")
  join(@ConnectedSocket() socket: Socket, @MessageBody() body: { chatId: string }) {
    void socket.join(body.chatId);
    return { ok: true };
  }

  @SubscribeMessage("chat:typing")
  typing(@ConnectedSocket() socket: Socket, @MessageBody() body: { chatId: string; nickname: string }) {
    socket.to(body.chatId).emit("chat:typing", { nickname: body.nickname });
  }

  @SubscribeMessage("chat:message")
  message(@MessageBody() body: { chatId: string; message: unknown }) {
    this.server.to(body.chatId).emit("chat:message", body.message);
  }
}
