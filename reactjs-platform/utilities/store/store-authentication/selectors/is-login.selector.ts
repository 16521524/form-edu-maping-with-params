import { getAccessTokenSelector } from './access-token.selector';
import { checkTokenExpiredUtil } from '../util';

export const isLoginSelector = (): boolean => {
  const token = getAccessTokenSelector();
  return !!token && !checkTokenExpiredUtil(token);
};
