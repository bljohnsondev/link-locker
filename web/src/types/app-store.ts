import { ToastMessage, UserDto } from '@/types';

export interface AppStore {
  theme?: string;
  user?: UserDto;
  toast?: ToastMessage;
}
