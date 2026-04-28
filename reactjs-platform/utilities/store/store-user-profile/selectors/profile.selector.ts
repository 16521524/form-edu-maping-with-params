import type { IUserProfile } from '../../../models';
import { profileStore } from '../user-profile.store';

export const getProfileSelector = (): IUserProfile | null => {
  return profileStore().profile;
};
