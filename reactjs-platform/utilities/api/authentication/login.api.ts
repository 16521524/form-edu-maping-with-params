import type { ILoginResponseData } from './refresh-token.api';
import { API } from '../api';

export const loginAPI = (username: string, password: string): Promise<ILoginResponseData> => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  return API.post<{ data: ILoginResponseData }>('/api/v1/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'clean-request': 'no-clean',
    },
  }).then((response) => response.data.data);
};
