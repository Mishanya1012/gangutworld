import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, JwtUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("chats")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(":chatId/messages")
  messages(@Param("chatId") chatId: string) {
    return this.prisma.message.findMany({
      where: { chatId },
      include: { sender: true },
      orderBy: { createdAt: "asc" },
      take: 100
    });
  }

  @Post(":chatId/messages")
  send(@CurrentUser() user: JwtUser, @Param("chatId") chatId: string, @Body() body: { message: string; attachmentUrl?: string }) {
    return this.prisma.message.create({
      data: {
        chatId,
        senderId: user.sub,
        message: body.message,
        attachmentUrl: body.attachmentUrl
      }
    });
  }
}
