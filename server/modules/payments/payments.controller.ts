import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, JwtUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("payments")
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("me")
  me(@CurrentUser() user: JwtUser) {
    return this.prisma.payment.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: "desc" }
    });
  }

  @Post("vip-request")
  requestVip(@CurrentUser() user: JwtUser, @Body() body: { amount: number; note?: string }) {
    return this.prisma.payment.create({
      data: {
        userId: user.sub,
        amount: body.amount,
        note: body.note ?? "Игрок просит выдать VIP после пополнения игрового баланса"
      }
    });
  }
}
