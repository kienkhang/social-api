import Elysia, { Context } from "elysia";
import { IUserService } from "../interface";
import { loginSchema, signupSchema, updateProfileSchema } from "../model";
import { successResponse } from "~/shared/utils/response";
import { AuthContext } from "~/shared/middleware";
import { MdlFactory, TokenType } from "~/shared/interface";
import { ErrTokenInvalid } from "~/shared/utils/error";

export class HttpUserController {
  constructor(private readonly service: IUserService) {}

  private async login(ctx: Context) {
    const form = loginSchema.parse(ctx.body);
    const data = await this.service.login(form);

    return successResponse(data, ctx);
  }

  private async signup(ctx: Context) {
    const form = signupSchema.parse(ctx.body);
    const data = await this.service.signup(form);

    return successResponse(data, ctx);
  }

  private async getProfile(ctx: AuthContext) {
    const user_id = ctx.decoded.sub;
    const data = await this.service.getProfile(user_id);

    return successResponse(data, ctx);
  }

  private async updateProfile(ctx: AuthContext) {
    const user_id = ctx.decoded.sub;
    const form = updateProfileSchema.parse(ctx.body);
    const data = await this.service.updateProfile(user_id, form);

    return successResponse(data, ctx);
  }

  private async renewToken(ctx: AuthContext) {
    const token = ctx.token;
    if (ctx.decoded.type !== TokenType.RefreshToken)
      throw ErrTokenInvalid.withLog("Not the expected token");

    const data = await this.service.renewToken(token);

    return successResponse(data, ctx);
  }

  private async logout(ctx: AuthContext) {
    const token = ctx.token;
    if (ctx.decoded.type !== TokenType.RefreshToken)
      throw ErrTokenInvalid.withLog("Not the expected token");

    const data = await this.service.logout(token);

    return successResponse(data, ctx);
  }

  getRoutes(mdlFactory: MdlFactory) {
    const routes = new Elysia({ prefix: "/users" })
      .post("/login", this.login.bind(this))
      .post("/signup", this.signup.bind(this))
      // auth middleware
      .derive(mdlFactory.auth)
      .get("/", this.getProfile.bind(this))
      .get("/update-profile", this.updateProfile.bind(this))
      .get("/renew", this.renewToken.bind(this))
      .get("/logout", this.logout.bind(this));
    return routes;
  }
}
