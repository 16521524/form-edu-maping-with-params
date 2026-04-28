import axios, { type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import type { ApiError } from './api.type';
import { API_ENDPOINT, CONFIGURATION } from '../constants';
import { LocalStorageService } from '../local-storage';
import { CookieService } from '../cookie-storage';
import { CoreAuthenticationStore } from '../store/store-authentication';

const API = axios.create({
  baseURL: `${API_ENDPOINT}`,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
});

API.interceptors.request.use(
  (requestConfig) => {
    const token =
      CookieService.getItem(CONFIGURATION.ACCESS_TOKEN_LS_KEY) ||
      CoreAuthenticationStore.getAccessTokenSelector() ||
      LocalStorageService.getItem(CONFIGURATION.ACCESS_TOKEN_LS_KEY);

    if (token) {
      requestConfig.headers = requestConfig.headers || {};
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    const serializerConfig = requestConfig;

    if (serializerConfig.headers && serializerConfig.headers['clean-request']?.toLocaleLowerCase() === 'no-clean') {
      return serializerConfig;
    }

    serializerConfig.paramsSerializer = (params) => {
      let result = '';
      Object.keys(params).forEach((key) => {
        if (params[key] == null) {
          return;
        }
        if (typeof params[key] === 'string') {
          const cleaned = params[key].trim().replace(/\s+/g, ' ');
          if (cleaned) {
            result += `${key}=${encodeURIComponent(cleaned)}&`;
          }
        } else {
          result += `${key}=${encodeURIComponent(params[key])}&`;
        }
      });
      return result.slice(0, -1);
    };

    try {
      const contentType = serializerConfig.headers?.['Content-Type'];

      if (typeof contentType === 'string' && contentType.includes('application/json')) {
        const bodyJsonData = serializerConfig.data;
        if (bodyJsonData) {
          Object.keys(bodyJsonData).forEach((key) => {
            if (typeof bodyJsonData[key] === 'string') {
              bodyJsonData[key] = bodyJsonData[key].trim().replace(/\s+/g, ' ');
            }
          });
          serializerConfig.data = JSON.stringify(bodyJsonData);
        }
      } else if (typeof contentType === 'string' && contentType.includes('application/x-www-form-urlencoded')) {
        const bodyFormData: URLSearchParams = serializerConfig.data;
        bodyFormData?.forEach((value, key) => {
          bodyFormData.set(key, value.trim().replace(/\s+/g, ' '));
        });
        serializerConfig.data = bodyFormData;
      }
    } catch (error) {
      toast.error(`Axios request error: ${JSON.stringify(error)}`);
    }

    return serializerConfig;
  },
  (error) => {
    return Promise.reject(error);
  },
);

API.interceptors.response.use(
  (response) => response,
  async (error: ApiError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; skipToast?: boolean };

    // Check if the error is due to request cancellation (abort)
    const isAbortError =
      error?.name === 'AbortError' || error?.code === 'ERR_CANCELED' || error?.message?.includes('canceled');

    // Check if toast should be skipped (either explicitly or for abort errors)
    const shouldSkipToast = originalRequest?.skipToast === true || isAbortError;

    // For abort errors, just reject without showing toast or further processing
    if (isAbortError) {
      return Promise.reject(error);
    }

    const message = (error as any)?.data?.message || error?.response?.data?.message || 'Unknown error';

    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const isAuthenticated = CoreAuthenticationStore.getIsAuthenticatedSelector();

      if (!isAuthenticated) {
        if (!shouldSkipToast) {
          toast.error(message);
        }
        return Promise.reject(new Error('Unauthorized'));
      }

      originalRequest._retry = true;

      const newToken = await CoreAuthenticationStore.refreshAccessToken();
      if (newToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      }

      CoreAuthenticationStore.logoutAction();

      if (!shouldSkipToast) {
        toast.error(message);
      }

      return Promise.reject(new Error(message));
    }

    if (!shouldSkipToast) {
      toast.error(message.toString());
    }

    throw new Error(message);
  },
);

const ThrowApiError = (error: ApiError) => {
  if (error.isAxiosError) {
    throw error.response?.data.code;
  }
  throw error;
};

export { API, ThrowApiError };
