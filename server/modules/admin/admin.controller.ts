import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, JwtUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("users")
  users() {
    return this.prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: "desc" },
      take: 100
    });
  }

  @Post("users/:id/block")
  async block(@CurrentUser() admin: JwtUser, @Param("id") id: string, @Body() body: { blocked: boolean }) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isBlocked: body.blocked }
    });
    await this.log(admin.sub, body.blocked ? "USER_BLOCKED" : "USER_UNBLOCKED", id, body);
    return user;
  }

  @Get("payments")
  payments() {
    return this.prisma.payment.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });
  }

  @Post("payments/:id/approve")
  async approvePayment(@CurrentUser() admin: JwtUser, @Param("id") id: string, @Body() body: { vipDays: number }) {
    const payment = await this.prisma.payment.findUniqueOrThrow({ where: { id } });
    const vipUntil = new Date(Date.now() + body.vipDays * 24 * 60 * 60 * 1000);

    const result = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id },
        data: { status: "APPROVED", approvedBy: admin.sub }
      }),
      this.prisma.user.update({
        where: { id: payment.userId },
        data: { role: "VIP", vipUntil }
      }),
      this.prisma.adminAction.create({
        data: {
          adminId: admin.sub,
          action: "VIP_APPROVED",
          targetId: payment.userId,
          metadata: { paymentId: id, vipDays: body.vipDays }
        }
      })
    ]);

    return { payment: result[0], user: result[1] };
  }

  @Post("users/:id/role")
  async setRole(@CurrentUser() admin: JwtUser, @Param("id") id: string, @Body() body: { role: "USER" | "VIP" | "ADMIN"; vipDays?: number }) {
    const vipUntil = body.role === "VIP" && body.vipDays ? new Date(Date.now() + body.vipDays * 24 * 60 * 60 * 1000) : undefined;
    const user = await this.prisma.user.update({
      where: { id },
      data: { role: body.role, vipUntil }
    });
    await this.log(admin.sub, "ROLE_CHANGED", id, body);
    return user;
  }

  @Get("reports")
  reports() {
    return this.prisma.report.findMany({
      include: { reporter: true, target: true },
      orderBy: { createdAt: "desc" }
    });
  }

  @Get("stats")
  async stats() {
    const [users, vip, reports, pendingPayments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: "VIP" } }),
      this.prisma.report.count({ where: { resolved: false } }),
      this.prisma.payment.count({ where: { status: "PENDING" } })
    ]);

    return { users, vip, reports, pendingPayments };
  }

  private log(adminId: string, action: string, targetId?: string, metadata?: unknown) {
    return this.prisma.adminAction.create({
      data: {
        adminId,
        action,
        targetId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined
      }
    });
  }
}
