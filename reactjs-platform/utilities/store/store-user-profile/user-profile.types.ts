import type { IUserProfile } from '../../models';

export interface IUserProfileStore {
  profile: IUserProfile | null;
  isFetchingProfile: boolean;
  fetchProfileError: string | null;
}
