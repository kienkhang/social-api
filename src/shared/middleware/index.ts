import { ITokenPayload, MdlFactory } from './../interface/index';
import { type Context } from 'elysia';
import { ErrTokenInvalid } from '../utils/error';
import jwt from '../common/jwt';

export interface AuthContext extends Context {
  decoded: ITokenPayload;
  token: string;
}

async function decodeToken(ctx: Context) {
  const token = ctx.headers['authorization']?.replace('Bearer', '').trim();

  if (!token) {
    throw ErrTokenInvalid.withLog('Token is missing');
  }

  const decoded = await jwt.verifyToken(token);
  if (!decoded) throw ErrTokenInvalid.withLog('Token parse failed');

  return {
    decoded,
    token,
  };
}

function setupMiddlewares(): MdlFactory {
  async function authMiddleware(ctx: Context) {
    const { decoded, token } = await decodeToken(ctx);
    return { decoded, token };
  }
  return {
    auth: authMiddleware,
    optAuth: authMiddleware,
  };
}

export default setupMiddlewares;
