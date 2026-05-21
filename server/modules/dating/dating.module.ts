import { Module } from "@nestjs/common";
import { DatingController } from "./dating.controller";

@Module({
  controllers: [DatingController]
})
export class DatingModule {}
