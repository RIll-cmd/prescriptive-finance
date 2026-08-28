import { create } from 'zustand';
import { Category } from '@financial-os/shared-types';
import { categoriesApi, CreateCategoryPayload, UpdateCategoryPayload } from '@/features/categories/api';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  createCategory: (payload: CreateCategoryPayload) => Promise<Category>;
  updateCategory: (id: string, payload: UpdateCategoryPayload) => Promise<Category>;
  deleteCategory: (id: string, reassignToId?: string) => Promise<void>;
  getCategoryById: (id?: string | null) => Category | undefined;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await categoriesApi.list();
      set({ categories: res.items || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch categories', isLoading: false });
    }
  },

  createCategory: async (payload: CreateCategoryPayload) => {
    try {
      const created = await categoriesApi.create(payload);
      await get().fetchCategories();
      return created;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create category' });
      throw err;
    }
  },

  updateCategory: async (id: string, payload: UpdateCategoryPayload) => {
    try {
      const updated = await categoriesApi.update(id, payload);
      await get().fetchCategories();
      return updated;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update category' });
      throw err;
    }
  },

  deleteCategory: async (id: string, reassignToId?: string) => {
    try {
      await categoriesApi.delete(id, reassignToId);
      await get().fetchCategories();
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete category' });
      throw err;
    }
  },

  getCategoryById: (id?: string | null) => {
    if (!id) return undefined;
    return get().categories.find((c) => c.id === id);
  },
}));
