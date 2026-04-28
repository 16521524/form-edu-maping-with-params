import { authenticationStore } from '../authentication.store';

export const getIsAuthenticatedSelector = (): boolean => {
  return authenticationStore.getState().isAuthenticated;
};
