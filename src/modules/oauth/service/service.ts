import { IOauthRepository, IOauthService } from '../interface';
import { AskLoginInput, LoginWithProviderInput } from '../model';
import { ErrInvalidRequest } from '~/shared/utils/error';

export class OauthService implements IOauthService {
  constructor(private readonly repository: IOauthRepository) {}

  loginWithProvider(input: LoginWithProviderInput): Promise<any> {
    const provider = input.provider;
    const strategies: { [key in AskLoginInput['provider']]: (f: any) => Promise<string> } = {
      google: this.repository.loginGoogle,
    };

    if (provider in strategies) {
      return strategies.google(input.form);
    } else {
      throw ErrInvalidRequest.withLog('Invalid provider');
    }
  }
  requestLogin(input: AskLoginInput): Promise<string> {
    const provider = input.provider;
    const strategies: { [key in AskLoginInput['provider']]: () => Promise<string> } = {
      google: this.repository.requestGoogle,
    };

    if (provider in strategies) {
      return strategies[provider]();
    } else {
      throw ErrInvalidRequest.withLog('Invalid provider');
    }
  }
}
