'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { useProfile } from './use-profile';

export interface UseTransactionSearchInitializerResult {
  initialSearchQuery: string;
  isReady: boolean;
}

/**
 * Reads the initial transaction search query from the current URL.
 * Transaction fetching should be handled per-feature using the user's id,
 * not partner_code (which no longer exists in the profile).
 */
export const useTransactionSearchInitializer = (): UseTransactionSearchInitializerResult => {
  const { profile } = useProfile();
  const searchParams = useSearchParams();

  const initialSearchQuery = useMemo(() => {
    return searchParams.get('key_search') ?? '';
  }, [searchParams]);

  return {
    initialSearchQuery,
    isReady: !!profile,
  };
};
