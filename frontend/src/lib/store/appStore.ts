import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ModalState {
  title: string;
  content: React.ReactNode | string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface AppState {
  loading: boolean;
  toasts: Toast[];
  modal: ModalState | null;
  setLoading: (loading: boolean) => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showModal: (modal: ModalState) => Promise<boolean>;
  closeModal: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  loading: false,
  toasts: [],
  modal: null,
  
  setLoading: (loading) => set({ loading }),
  
  showToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    
    // 自动移除
    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration || 3000);
  },
  
  removeToast: (id) => 
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  
  showModal: (modal) => {
    return new Promise((resolve) => {
      set({
        modal: {
          ...modal,
          onConfirm: () => {
            modal.onConfirm?.();
            set({ modal: null });
            resolve(true);
          },
          onCancel: () => {
            modal.onCancel?.();
            set({ modal: null });
            resolve(false);
          },
        },
      });
    });
  },
  
  closeModal: () => set({ modal: null }),
}));
