import { api } from '../lib/api';
import { Category, CreateUpdateCategory, PagedResult, PagedRequestParams } from '@/types';

export const categoryService = {
  // Lấy danh sách danh mục có phân trang
  getPaged: async (params?: PagedRequestParams) => {
    const response = await api.get<PagedResult<Category>>('/api/categories/paged', { params });
    return response.data;
  },

  // Lấy tất cả danh mục đang hoạt động
  getAll: async () => {
    const response = await api.get<Category[]>('/api/categories');
    return response.data;
  },

  // Lấy chi tiết theo ID
  getById: async (id: number) => {
    const response = await api.get<Category>(`/api/categories/${id}`);
    return response.data;
  },

  // Thêm mới danh mục
  create: async (data: CreateUpdateCategory) => {
    const response = await api.post<Category>('/api/categories', data);
    return response.data;
  },

  // Cập nhật thông tin danh mục
  update: async (id: number, data: CreateUpdateCategory) => {
    const response = await api.put<Category>(`/api/categories/${id}`, data);
    return response.data;
  },

  // Xóa danh mục
  delete: async (id: number) => {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  },
};
