import { IAuthen } from '~/modules/user/model';
import { LoginWithProviderInput, AskLoginInput, LoginWithGoogleInput } from '../model';

export interface IOauthRepository {
  requestGoogle(): Promise<string>;
  loginGoogle(input: LoginWithGoogleInput): Promise<string>;
}

export interface IOauthService {
  requestLogin(form: AskLoginInput): Promise<string>;
  loginWithProvider(form: LoginWithProviderInput): Promise<any>;
}
