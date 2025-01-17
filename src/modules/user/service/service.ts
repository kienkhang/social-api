import { google } from 'googleapis';
import { ObjectId } from 'mongodb';
import { TokenRequestResult } from '@oslojs/oauth2';

// Interface
import { IUserService } from '../interface';
import { ITokenPayload, TokenType } from '~/shared/interface';
// Model
import { ILoginForm, IAuthen, ISignupForm, IUpdateProfileForm, User, userSchema } from '../model';
import { AskLoginInput, LoginWithGoogleInput, LoginWithProviderInput } from '../model/oauth';
import { ErrInvalidEmailAndPassword } from '../model/error';
import { AppError, ErrInvalidRequest } from '~/shared/utils/error';
import { MongodbUserRepository } from './mongodb';
// Utils
import appConfig from '~/shared/common/config';
import mongodbService from '~/shared/common/mongodb';
import jwt from '~/shared/common/jwt';
import { hashPassword } from '~/shared/common/hash';

const googleOauthClient = new google.auth.OAuth2({
  clientId: appConfig.oauth.ggClientId,
  clientSecret: appConfig.oauth.ggClientSecret,
  redirectUri: 'http://localhost:8080/oauth/google/callback',
});

export class UserService implements IUserService {
  constructor(private readonly repository: MongodbUserRepository) {}

  private async generateToken(userId: string, refreshTokenExpired = appConfig.jwt.refreshTokenExpiresIn) {
    // Generate token
    const [access_token, refresh_token] = await Promise.all([
      // this.repository.generateToken(user._id.toString(), TokenType.AccessToken),
      this.repository.generateToken({ userId, type: TokenType.AccessToken }),
      this.repository.generateToken({
        userId,
        type: TokenType.RefreshToken,
        expiresIn: refreshTokenExpired,
      }),
    ]);

    // Add new refresh token to db
    await mongodbService.refreshTokens.insertOne({ token: refresh_token });
    return {
      access_token,
      refresh_token,
    };
  }

  async login(form: ILoginForm): Promise<IAuthen> {
    const user = await this.repository.findByCond({
      ...form,
      password: hashPassword(form.password),
    });

    if (!user) throw AppError.from(ErrInvalidEmailAndPassword, 400).withLog('Incorrect login information');

    const generated = await this.generateToken(user._id.toString());
    return generated;
  }
  async signup(form: ISignupForm): Promise<IAuthen> {
    const newUser = userSchema.parse({ ...form, _id: new ObjectId() });
    const user = await this.repository.insert(newUser);

    if (!user) throw AppError.from(ErrInvalidRequest, 400).withLog('Incorrect login information');

    const generated = await this.generateToken(user._id.toString());
    return generated;
  }

  async getProfile(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    return user as User;
  }
  async updateProfile(id: string, form: IUpdateProfileForm): Promise<User> {
    await this.repository.update(id, form);
    const user = await this.repository.findById(id);
    return user as User;
  }
  async renewToken(oldRefreshToken: string): Promise<IAuthen> {
    const decoded = (await jwt.verifyToken(oldRefreshToken)) as ITokenPayload;

    const remainingTime = decoded.exp! - Math.floor(Date.now() / 1000);

    const generated = await this.generateToken(decoded.sub, `${remainingTime}s`);
    // Remove old token from db
    await mongodbService.refreshTokens.deleteOne({ token: oldRefreshToken });
    return generated;
  }
  async logout(refreshToken: string): Promise<boolean> {
    // Remove token from db
    await mongodbService.refreshTokens.deleteOne({ token: refreshToken });
    return true;
  }

  // ============== Oauth =============
  // Request with oauth
  private async requestGoogle(): Promise<string> {
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
    return url;
  }

  // Login with oauth
  private async loginGoogle({ code, state }: LoginWithGoogleInput): Promise<IAuthen> {
    if (!code) {
      throw ErrInvalidRequest.withMessage('Code mismatch');
    } else if (!state) {
      throw ErrInvalidRequest.withMessage('State mismatch. Possible CSRF attack');
    }

    // Get response with code
    const { res } = await googleOauthClient.getToken(code);

    // Parse response
    const result = new TokenRequestResult(res?.data);
    const ggResp = await google.oauth2('v2').userinfo.get({ oauth_token: result.accessToken() });
    // Check exist with email
    const user = await this.repository.findByCond({ email: ggResp.data.email as string });
    if (user) {
      // If exist => return this user
      const generated = await this.generateToken(user._id.toString());
      return generated;
    } else {
      // Else => signup user
      const signupResp = await this.signup({
        email: ggResp.data.email as string,
        name: ggResp.data.name as string,
        username: ggResp.data.id as string,
        password: hashPassword(crypto.randomUUID()),
      });
      return signupResp;
    }
  }

  loginWithProvider(input: LoginWithProviderInput): Promise<IAuthen> {
    const provider = input.provider;
    const strategies: { [key in AskLoginInput['provider']]: (f: any) => Promise<IAuthen> } = {
      google: this.loginGoogle,
    };

    if (provider in strategies) {
      return strategies[provider](input.form);
    } else {
      throw ErrInvalidRequest.withLog('Invalid provider');
    }
  }
  requestLogin(input: AskLoginInput): Promise<string> {
    const provider = input.provider;
    const strategies: { [key in AskLoginInput['provider']]: () => Promise<string> } = {
      google: this.requestGoogle,
    };

    if (provider in strategies) {
      return strategies[provider]();
    } else {
      throw ErrInvalidRequest.withLog('Invalid provider');
    }
  }
}
