export interface AppRouterLocal {
  push: (href: string) => void;
  replace: (href: string) => void;
  refresh: () => void;
  prefetch?: (href: string) => Promise<void>;
}
