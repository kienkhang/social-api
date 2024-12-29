import { type Context } from "elysia";
import jwt from "jsonwebtoken";
import { z } from "zod";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EMailVerifyToken,
}

// Paging
export const pagingSchema = z.object({
  page: z.coerce
    .number()
    .min(1, { message: "Page number must be at least 1" })
    .default(1),
  limit: z.coerce
    .number()
    .min(1, { message: "Limit must be at least 1" })
    .max(100)
    .default(20),
  sort: z.string().optional(),
  order: z.string().optional(),
});
export type Paging = z.infer<typeof pagingSchema>;

export type Paginated<E> = {
  entries: E[];
  metadata: Paging & {
    total: number;
    hasNext: boolean;
  };
};

export interface ITokenPayload extends jwt.JwtPayload {
  sub: string;
  role: UserRole;
  type: TokenType;
}

export interface MdlFactory {
  auth: (ctx: Context) => Promise<{ token: string; decoded: ITokenPayload }>;
  optAuth: (ctx: Context) => Promise<{ token: string; decoded: ITokenPayload }>;
  // allowRoles: (roles: UserRole[]) => Promise<any>;
}

export type ServiceContext = {
  mdlFactory: MdlFactory;
};
