import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { ErrNameAtLeast2Chars, ErrPasswordAtLeast6Chars, ErrUsernameInvalid } from './error';
import { UserRole } from '~/shared/interface';
import { hashPassword } from '~/shared/common/hash';

export interface IAuthen {
  access_token: string;
  refresh_token: string;
}

export enum Status {
  ACTIVE = 'active',
  PENDING = 'pending',
  INACTIVE = 'inactive',
  BANNED = 'banned',
  DELETED = 'deleted',
}

export const userSchema = z.object({
  _id: z.instanceof(ObjectId),
  name: z.string().min(2, ErrNameAtLeast2Chars.message),
  email: z.string().email(),
  password: z
    .string()
    .min(6, ErrPasswordAtLeast6Chars.message)
    .transform((arg) => hashPassword(arg)),
  username: z
    .string()
    .min(3, 'Username must not be less than 3 characters')
    .max(30, 'Username must not be greater than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, ErrUsernameInvalid.message),
  created_at: z.date().default(new Date()),
  updated_at: z.date().default(new Date()),
  status: z.nativeEnum(Status).optional().default(Status.PENDING),
  role: z.nativeEnum(UserRole).optional().default(UserRole.PERSONAL),
  email_verify_token: z.string().optional().nullable().default(null),
  forgot_password_token: z.string().optional().nullable().default(null),
  bio: z.string().optional().default(''),
  avatar: z.string().optional().default(''),
});

export type User = z.infer<typeof userSchema>;

// Login
export const emailLoginSchema = userSchema
  .pick({
    email: true,
    password: true,
  })
  .required();
export const usernameLoginSchema = userSchema
  .pick({
    username: true,
    password: true,
  })
  .required();

export const loginSchema = z.union([emailLoginSchema, usernameLoginSchema]);
export type ILoginForm = z.infer<typeof loginSchema>;
// Sign up
export const signupSchema = userSchema
  .pick({
    name: true,
    email: true,
    password: true,
    username: true,
  })
  .required();

export type ISignupForm = z.infer<typeof signupSchema>;

// Update
export const updateUserSchema = userSchema
  .pick({
    name: true,
    password: true,
    role: true,
    status: true,
    email_verify_token: true,
    forgot_password_token: true,
    bio: true,
    avatar: true,
  })
  .partial();

export const updateProfileSchema = updateUserSchema
  .omit({
    role: true,
    status: true,
  })
  .partial();

export type IUpdateProfileForm = z.infer<typeof updateProfileSchema>;

export type IUpdateUserForm = z.infer<typeof updateUserSchema>;
// Query
export const userCondSchema = userSchema
  .pick({
    _id: true,
    name: true,
    email: true,
    password: true,
    username: true,
    status: true,
  })
  .partial();

export type IUserCondForm = z.infer<typeof userCondSchema>;
