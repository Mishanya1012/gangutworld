import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./chat/chat.module";
import { DatingModule } from "./dating/dating.module";
import { PaymentsModule } from "./payments/payments.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProfilesModule } from "./profiles/profiles.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", "../.env"] }),
    ThrottlerModule.forRoot([{ limit: 80, ttl: 60000 }]),
    PrismaModule,
    AuthModule,
    ProfilesModule,
    DatingModule,
    ChatModule,
    PaymentsModule,
    AdminModule
  ]
})
export class AppModule {}
