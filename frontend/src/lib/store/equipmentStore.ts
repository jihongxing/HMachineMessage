import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EquipmentFormData } from '../api/endpoints/equipment';

interface SearchFilters {
  category1?: string;
  category2?: string;
  province?: string;
  city?: string;
  county?: string;
  keyword?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: string;
}

interface EquipmentDraft extends EquipmentFormData {
  _savedAt?: number;
}

interface EquipmentState {
  filters: SearchFilters;
  draft: EquipmentDraft | null;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  saveDraft: (data: EquipmentFormData) => void;
  getDraft: () => EquipmentDraft | null;
  clearDraft: () => void;
}

export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      filters: {},
      draft: null,
      
      setFilters: (filters) => 
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      
      clearFilters: () => set({ filters: {} }),
      
      saveDraft: (data) => {
        set({ draft: { ...data, _savedAt: Date.now() } });
      },
      
      getDraft: () => {
        const draft = get().draft;
        if (!draft) return null;
        
        // 检查是否过期（7天）
        const savedAt = draft._savedAt || 0;
        const now = Date.now();
        const days = (now - savedAt) / (1000 * 60 * 60 * 24);
        
        if (days > 7) {
          set({ draft: null });
          return null;
        }
        
        return draft;
      },
      
      clearDraft: () => set({ draft: null }),
    }),
    { name: 'equipment-storage' }
  )
);
