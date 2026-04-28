import { pureAxios } from '../pure-axios';

export interface ILoginResponseData {
  access_token: string;
  refresh_token: string;
}
export const refreshTokenAPI = (refreshToken: string): Promise<ILoginResponseData> => {
  return pureAxios
    .post<{ data: ILoginResponseData }>(
      '/api/v1/users/refresh-token',
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'clean-request': 'no-clean',
        },
      },
    )
    .then((response) => response.data.data);
};
