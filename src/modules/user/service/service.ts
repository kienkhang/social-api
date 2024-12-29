import { AppError } from "~/shared/utils/error";
import { IUserService } from "../interface";
import {
  ILoginForm,
  IAuthen,
  ISignupForm,
  IUpdateProfileForm,
  User,
  userSchema,
} from "../model";
import { MongodbUserRepository } from "./mongodb";
import { ErrInvalidEmailAndPassword } from "../model/error";
import { ITokenPayload, TokenType } from "~/shared/interface";
import appConfig from "~/shared/common/config";
import jwt from "~/shared/common/jwt";
import mongodbService from "~/shared/common/mongodb";
import { hashPassword } from "~/shared/common/hash";

export class UserService implements IUserService {
  constructor(private readonly repository: MongodbUserRepository) {}

  async login(form: ILoginForm): Promise<IAuthen> {
    const user = await this.repository.findByCond({
      ...form,
      password: hashPassword(form.password),
    });

    if (!user)
      throw AppError.from(ErrInvalidEmailAndPassword, 400).withLog(
        "Incorrect login information"
      );

    // Generate token
    const [access_token, refresh_token] = await Promise.all([
      this.repository.generateToken(user._id.toString(), TokenType.AccessToken),
      this.repository.generateToken(
        user._id.toString(),
        TokenType.RefreshToken,
        appConfig.jwt.refreshTokenExpiresIn
      ),
    ]);

    // Add new refresh token to db
    await mongodbService.refreshTokens.insertOne({ token: refresh_token });
    return {
      access_token,
      refresh_token,
    };
  }
  async signup(form: ISignupForm): Promise<IAuthen> {
    const newUser = userSchema.parse(form);
    const user = await this.repository.insert(newUser);

    if (!user)
      throw AppError.from(ErrInvalidEmailAndPassword, 400).withLog(
        "Incorrect login information"
      );

    // Generate token
    const [access_token, refresh_token] = await Promise.all([
      this.repository.generateToken(user._id.toString(), TokenType.AccessToken),
      this.repository.generateToken(
        user._id.toString(),
        TokenType.RefreshToken,
        appConfig.jwt.refreshTokenExpiresIn
      ),
    ]);

    // Add new refresh token to db
    await mongodbService.refreshTokens.insertOne({ token: refresh_token });

    return {
      access_token,
      refresh_token,
    };
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

    // Create new token
    const [access_token, refresh_token] = await Promise.all([
      this.repository.generateToken(decoded.sub, TokenType.AccessToken),
      this.repository.generateToken(
        decoded.sub,
        TokenType.RefreshToken,
        `${remainingTime}s`
      ),
    ]);

    // Add new refresh token to db
    await mongodbService.refreshTokens.insertOne({ token: refresh_token });
    // Remove old token from db
    await mongodbService.refreshTokens.deleteOne({ token: oldRefreshToken });
    return {
      access_token,
      refresh_token,
    };
  }
  async logout(refreshToken: string): Promise<boolean> {
    // Remove token from db
    await mongodbService.refreshTokens.deleteOne({ token: refreshToken });
    return true;
  }
}
