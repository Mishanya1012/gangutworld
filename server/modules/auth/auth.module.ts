import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { DiscordStrategy } from "./discord.strategy";
import { JwtStrategy } from "./jwt.strategy";
import { RolesGuard } from "./roles.guard";

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET") ?? "dev_secret",
        signOptions: { expiresIn: config.get<string>("JWT_EXPIRES_IN") ?? "7d" }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, DiscordStrategy, JwtStrategy, RolesGuard],
  exports: [AuthService, JwtModule, RolesGuard]
})
export class AuthModule {}
