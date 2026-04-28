const readClientEnv = (...keys: string[]) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
};

const getClientEnv = (value: string | undefined, fallback: string) => {
  return value && value.trim().length > 0 ? value : fallback;
};

const getApiEndpoint = () => {
  const configuredEndpoint = readClientEnv('NEXT_PUBLIC_API_ENDPOINT', 'VITE_API_ENDPOINT');

  if (configuredEndpoint) {
    return configuredEndpoint;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:4002';
  }

  throw new Error('Missing NEXT_PUBLIC_API_ENDPOINT or VITE_API_ENDPOINT at build time');
};

const API_ENDPOINT = getApiEndpoint();
const DEFAULT_TIMEZONE = getClientEnv(
  readClientEnv('NEXT_PUBLIC_DEFAULT_TIMEZONE', 'VITE_DEFAULT_TIMEZONE'),
  'Asia/Ho_Chi_Minh',
);
const CURRENCY_ENABLE_COMPACT = true;
const ALLOW_EDIT_ALL_STATUS = true;

export { API_ENDPOINT, DEFAULT_TIMEZONE, CURRENCY_ENABLE_COMPACT, ALLOW_EDIT_ALL_STATUS };
