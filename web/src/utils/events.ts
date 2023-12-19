import { ToastMessage, UserDto } from '@/types';

export const createEvent = (name: string, detail?: any): CustomEvent => {
  return new CustomEvent(name, {
    bubbles: true,
    composed: true,
    detail,
  });
};

export const changeUserEvent = (user?: UserDto) => {
  return createEvent('change-appstore', { user });
};

export const toastEvent = (toast: ToastMessage) => {
  return createEvent('toast', { toast });
};

export const preventSubmitOnEnter = (event: Event) => {
  const kbEvent = event as KeyboardEvent;
  if (kbEvent.key === 'Enter') {
    kbEvent.preventDefault();
  }
};
