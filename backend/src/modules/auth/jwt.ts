import jwt, { type SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '@/config/env';

export interface AccessTokenPayload {
  sub: string;
  role: Role;
  name: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwt.expiresIn,
  };

  return jwt.sign(payload, env.jwt.secret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.secret) as AccessTokenPayload;
}

export function signRefreshToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: env.jwt.refreshExpiresIn,
  };

  return jwt.sign(
    { sub: userId },
    env.jwt.refreshSecret,
    options
  );
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwt.refreshSecret) as { sub: string };
}