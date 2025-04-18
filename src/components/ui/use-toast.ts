// Stub useToast hook for toast-manager
export function useToast() {
  return {
    toasts: [] as any[],
    dismiss: (_id: string) => {},
    toast: (_options: any) => '',
  };
}
