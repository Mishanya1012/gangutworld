import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-discord";

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord") {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>("DISCORD_CLIENT_ID") ?? "",
      clientSecret: config.get<string>("DISCORD_CLIENT_SECRET") ?? "",
      callbackURL: config.get<string>("DISCORD_CALLBACK_URL") ?? "http://localhost:4000/auth/discord/callback",
      scope: ["identify"]
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: DiscordProfile) {
    return {
      discordId: profile.id,
      discordUsername: profile.username,
      discordAvatar: profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
        : null
    };
  }
}

type DiscordProfile = {
  id: string;
  username: string;
  avatar?: string;
};
