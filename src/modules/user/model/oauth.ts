import { Context } from 'elysia';

export type AskLoginInput = {
  provider: string;
  state: string;
};

export type LoginWithProviderInput = {
  provider: string;
  login_state: string;
  form: any;
};

export type LoginWithGoogleInput = {
  code: string;
  state: string;
  login_state: string;
};

export type OauthContext = Context & {
  store: {
    login_state: string;
  };
};
