import { google, oauth2_v2 } from 'googleapis';
import appConfig from '~/shared/common/config';
import { IOauthRepository } from '../interface';
import { IAuthen } from '~/modules/user/model';
import { LoginWithGoogleInput } from '../model';
import { TokenRequestResult } from '@oslojs/oauth2';
import { ErrInvalidRequest } from '~/shared/utils/error';

const googleOauthClient = new google.auth.OAuth2({
  clientId: appConfig.oauth.ggClientId,
  clientSecret: appConfig.oauth.ggClientSecret,
  redirectUri: 'http://localhost:8080/oauth/google/callback',
});
export class OauthRepositoryService implements IOauthRepository {
  // Request with oauth
  async requestGoogle(): Promise<string> {
    const scope = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ]; // https://developers.google.com/identity/protocols/oauth2/scopes?hl=vi
    const state = crypto.randomUUID();
    const url = googleOauthClient.generateAuthUrl({
      scope,
      state,
      response_type: 'code',
      include_granted_scopes: true,
    });
    console.log('🐣🦆 ~ IOauthRepositoryService ~ requestGoogle ~ url:', url);
    return url;
  }

  // Login with oauth
  async loginGoogle({ code, state }: LoginWithGoogleInput): Promise<any> {
    if (!code) {
      throw ErrInvalidRequest.withMessage('Code mismatch');
    } else if (!state) {
      throw ErrInvalidRequest.withMessage('State mismatch. Possible CSRF attack');
    }

    const { res } = await googleOauthClient.getToken(code);
    console.log('🐣🦆 ~ IOauthRepositoryService ~ loginGoogle ~ res:', res);
    const result = new TokenRequestResult(res?.data);

    const oauth2 = google.oauth2('v2').userinfo.get({ oauth_token: result.accessToken() });
    console.log('🐣🦆 ~ OauthRepositoryService ~ loginGoogle ~ oauth2:', oauth2);
    return oauth2;
  }
}
