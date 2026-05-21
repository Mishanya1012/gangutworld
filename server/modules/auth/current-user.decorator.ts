import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type JwtUser = {
  sub: string;
  role: "USER" | "VIP" | "ADMIN";
  discordId: string;
};

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): JwtUser => {
  const request = context.switchToHttp().getRequest<{ user: JwtUser }>();
  return request.user;
});
