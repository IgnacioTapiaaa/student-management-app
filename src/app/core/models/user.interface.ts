export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export type CreateUser = Omit<User, 'id'>;
export type LoginCredentials = Pick<User, 'email' | 'password'>;
