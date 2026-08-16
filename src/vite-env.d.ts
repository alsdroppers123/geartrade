/// <reference types="vite/client" />

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: any) => void;
        renderButton: (parent: HTMLElement, options: any) => void;
        prompt: (momentListener?: (moment: any) => void) => void;
        disableAutoSelect: () => void;
      };
    };
  };
}
