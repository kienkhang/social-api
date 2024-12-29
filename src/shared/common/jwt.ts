import { ITokenPayload } from '../interface';
import jwt from 'jsonwebtoken';
import appConfig from './config';

async function generateToken({ payload, options = {} }: { payload: ITokenPayload; options?: jwt.SignOptions }) {
  return jwt.sign(payload, appConfig.jwt.secretKey as string, options);
}
async function verifyToken(token: string): Promise<ITokenPayload | null> {
  try {
    return jwt.verify(token, appConfig.jwt.secretKey as string) as ITokenPayload;
  } catch (error) {
    return null;
  }
}

export default {
  generateToken,
  verifyToken,
};
