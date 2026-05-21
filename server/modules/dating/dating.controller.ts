import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser, JwtUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class DatingController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("search")
  search(@CurrentUser() user: JwtUser, @Query("city") city?: string) {
    return this.prisma.user.findMany({
      where: {
        id: { not: user.sub },
        isBlocked: false,
        profile: {
          hidden: false,
          ...(city ? { city } : {})
        }
      },
      include: { profile: { include: { photos: true } } },
      take: 50,
      orderBy: { createdAt: "desc" }
    });
  }

  @Post("likes")
  async like(@CurrentUser() user: JwtUser, @Body() body: { toUserId: string }) {
    await this.prisma.like.upsert({
      where: { fromUserId_toUserId: { fromUserId: user.sub, toUserId: body.toUserId } },
      update: {},
      create: { fromUserId: user.sub, toUserId: body.toUserId }
    });

    const reciprocal = await this.prisma.like.findUnique({
      where: { fromUserId_toUserId: { fromUserId: body.toUserId, toUserId: user.sub } }
    });

    if (!reciprocal) {
      return { matched: false };
    }

    const [userAId, userBId] = [user.sub, body.toUserId].sort();
    const match = await this.prisma.match.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      update: {},
      create: {
        userAId,
        userBId,
        chat: { create: {} }
      },
      include: { chat: true }
    });

    return { matched: true, match };
  }

  @Get("likes")
  @UseGuards(RolesGuard)
  @Roles("VIP", "ADMIN")
  likes(@CurrentUser() user: JwtUser) {
    return this.prisma.like.findMany({
      where: { toUserId: user.sub },
      include: { fromUser: { include: { profile: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  @Get("matches")
  matches(@CurrentUser() user: JwtUser) {
    return this.prisma.match.findMany({
      where: { OR: [{ userAId: user.sub }, { userBId: user.sub }] },
      include: { userA: true, userB: true, chat: true },
      orderBy: { createdAt: "desc" }
    });
  }

  @Get("visitors")
  visitors(@CurrentUser() user: JwtUser) {
    return this.prisma.profileVisit.findMany({
      where: { targetId: user.sub },
      include: { visitor: { include: { profile: true } } },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }
}
