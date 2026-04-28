import { authenticationStore } from '../authentication.store';

export const getAccessTokenSelector = (): string | null => {
  return authenticationStore.getState().accessToken;
};
