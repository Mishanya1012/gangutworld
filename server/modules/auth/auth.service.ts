import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";

type DiscordUser = {
  discordId: string;
  discordUsername: string;
  discordAvatar?: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async upsertDiscordUser(discordUser: DiscordUser) {
    if (!discordUser.discordId) {
      throw new UnauthorizedException("Discord profile is missing id");
    }

    const adminDiscordIds = (this.config.get<string>("ADMIN_DISCORD_IDS") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const existing = await this.prisma.user.findUnique({ where: { discordId: discordUser.discordId } });
    const role = existing?.role ?? (adminDiscordIds.includes(discordUser.discordId) ? "ADMIN" : "USER");

    return this.prisma.user.upsert({
      where: { discordId: discordUser.discordId },
      update: {
        discordUsername: discordUser.discordUsername,
        discordAvatar: discordUser.discordAvatar,
        role
      },
      create: {
        discordId: discordUser.discordId,
        discordUsername: discordUser.discordUsername,
        discordAvatar: discordUser.discordAvatar,
        socialNickname: discordUser.discordUsername,
        ucpName: "",
        role,
        profile: {
          create: {}
        }
      }
    });
  }

  signAccessToken(user: { id: string; role: "USER" | "VIP" | "ADMIN"; discordId: string }) {
    return this.jwt.sign({
      sub: user.id,
      role: user.role,
      discordId: user.discordId
    });
  }
}
