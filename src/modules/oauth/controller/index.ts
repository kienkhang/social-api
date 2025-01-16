import Elysia, { Context } from 'elysia';
import { IOauthService } from '../interface';
import { successResponse } from '~/shared/utils/response';

export class HttpOauthController {
  constructor(private readonly service: IOauthService) {}
  private async requestLogin(ctx: Context) {
    const redirectUri = await this.service.requestLogin({ provider: ctx.params.provider });

    return successResponse({ url: redirectUri }, ctx);
  }

  private async loginWithProvider(ctx: Context) {
    const profile = await this.service.loginWithProvider({ provider: ctx.params.provider, form: ctx.body });
    return successResponse(profile, ctx);
  }

  getRoutes() {
    const routes = new Elysia({ prefix: '/oauth' })
      .get('/request/:provider', this.requestLogin.bind(this))
      .post('/login/:provider', this.loginWithProvider.bind(this));
    return routes;
  }
}
