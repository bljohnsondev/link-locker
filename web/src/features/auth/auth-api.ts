import { axios } from '@/lib/axios';
import { UserDto } from '@/types';

export interface LoginResponse {
  user?: UserDto;
  token?: string;
}

export const apiLogin = async (username: string, password: string): Promise<LoginResponse> => {
  return await axios.post('/auth/login', {
    username,
    password,
  });
};

export const getUser = async (): Promise<UserDto | undefined> => {
  return await axios.get('/auth/user');
};
