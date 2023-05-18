export default interface VerifyState {
  email: string;
  emailVerified: boolean;
  code: string;
  codeVerified: false;
  errorMsg: string;
}
