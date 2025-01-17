export type AskLoginInput = {
  provider: string;
};

export type LoginWithProviderInput = {
  provider: string;
  form: any;
};

export type LoginWithGoogleInput = {
  code: string;
  state: string;
};
