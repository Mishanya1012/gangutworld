import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { CurrentUser, JwtUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("profiles")
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("me")
  me(@CurrentUser() user: JwtUser) {
    return this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { profile: { include: { photos: true } } }
    });
  }

  @Put("me")
  updateMe(
    @CurrentUser() user: JwtUser,
    @Body() body: { socialNickname?: string; ucpName?: string; age?: number; city?: string; bio?: string; interests?: string[]; hidden?: boolean }
  ) {
    return this.prisma.user.update({
      where: { id: user.sub },
      data: {
        socialNickname: body.socialNickname,
        ucpName: body.ucpName,
        profile: {
          upsert: {
            create: {
              age: body.age,
              city: body.city,
              bio: body.bio,
              interests: body.interests ?? [],
              hidden: body.hidden ?? false
            },
            update: {
              age: body.age,
              city: body.city,
              bio: body.bio,
              interests: body.interests,
              hidden: body.hidden
            }
          }
        }
      },
      include: { profile: true }
    });
  }

  @Get(":id")
  async getProfile(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    if (id !== user.sub) {
      await this.prisma.profileVisit.create({
        data: { visitorId: user.sub, targetId: id }
      });
    }

    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: { include: { photos: true } } }
    });
  }
}
