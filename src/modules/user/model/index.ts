import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { ErrNameAtLeast2Chars, ErrPasswordAtLeast6Chars, ErrUsernameInvalid } from './error';
import { UserRole } from '~/shared/interface';

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
  password: z.string().min(6, ErrPasswordAtLeast6Chars.message),
  username: z
    .string()
    .min(3, 'Username must not be less than 3 characters')
    .max(20, 'Username must not be greater than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, ErrUsernameInvalid.message),
  created_at: z.date().default(new Date()),
  updated_at: z.date().default(new Date()),
  status: z.nativeEnum(Status).default(Status.PENDING).optional(),
  role: z.nativeEnum(UserRole).default(UserRole.PERSONAL).optional(),
  email_verify_token: z.string().nullable().optional(),
  forgot_password_token: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
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
