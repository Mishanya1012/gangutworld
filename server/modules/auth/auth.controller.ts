import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { CurrentUser, JwtUser } from "./current-user.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  @Get("discord")
  @UseGuards(AuthGuard("discord"))
  discordLogin() {
    return;
  }

  @Get("discord/callback")
  @UseGuards(AuthGuard("discord"))
  async discordCallback(@Req() request: { user: DiscordCallbackUser }, @Res() response: Response) {
    const user = await this.auth.upsertDiscordUser(request.user);
    const token = this.auth.signAccessToken({
      id: user.id,
      role: user.role as "USER" | "VIP" | "ADMIN",
      discordId: user.discordId
    });
    const frontendUrl = this.config.get<string>("FRONTEND_URL") ?? "http://localhost:3000";

    response.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: frontendUrl.startsWith("https://")
    });
    response.redirect(`${frontendUrl}/?token=${token}`);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtUser) {
    return this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { profile: true }
    });
  }

  @Post("complete-profile")
  @UseGuards(JwtAuthGuard)
  async completeProfile(
    @CurrentUser() user: JwtUser,
    @Body() body: { ucpName: string; socialNickname: string; age?: number; city?: string; bio?: string }
  ) {
    return this.prisma.user.update({
      where: { id: user.sub },
      data: {
        ucpName: body.ucpName,
        socialNickname: body.socialNickname,
        profile: {
          upsert: {
            create: { age: body.age, city: body.city, bio: body.bio },
            update: { age: body.age, city: body.city, bio: body.bio }
          }
        }
      },
      include: { profile: true }
    });
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("access_token");
    return { ok: true };
  }
}

type DiscordCallbackUser = {
  discordId: string;
  discordUsername: string;
  discordAvatar?: string | null;
};
