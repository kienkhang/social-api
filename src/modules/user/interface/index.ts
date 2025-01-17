import { Paginated, Paging, TokenType, UserRole } from '~/shared/interface';
import { IAuthen, ILoginForm, ISignupForm, IUpdateProfileForm, IUpdateUserForm, IUserCondForm, User } from '../model';
import { AskLoginInput, LoginWithProviderInput } from '../model/oauth';

export interface IUserRepository {
  insert: (user: User) => Promise<User>;
  update: (id: string, form: IUpdateUserForm) => Promise<boolean>;
  findById: (id: string) => Promise<User | null>;
  findByCond: (cond: IUserCondForm) => Promise<User | null>;
  list: (cond: IUserCondForm, paging: Paging) => Promise<Paginated<User>>;
  generateToken: (form: { userId: string; type: TokenType; role?: UserRole; expiresIn?: string }) => Promise<string>;
}

export interface IUserService {
  login: (form: ILoginForm) => Promise<IAuthen>;
  signup: (form: ISignupForm) => Promise<IAuthen>;
  getProfile: (id: string) => Promise<User>;
  updateProfile: (id: string, form: IUpdateProfileForm) => Promise<User>;
  renewToken: (oldRefreshToken: string) => Promise<IAuthen>;
  logout: (refreshToken: string) => Promise<boolean>;
  // Oauth
  requestLogin(form: AskLoginInput): Promise<string>;
  loginWithProvider(form: LoginWithProviderInput): Promise<IAuthen>;
}
