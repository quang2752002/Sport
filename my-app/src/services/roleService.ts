import { api } from '../lib/api';
import { Role, PermissionGroup, UpdateRolePermissionsPayload } from '@/types';

export const roleService = {
  // Lấy danh sách toàn bộ các Role kèm permissions
  getRoles: async () => {
    const res = await api.get<Role[]>('/api/roles');
    return res.data;
  },

  // Lấy cây phân loại Permissions theo nhóm
  getPermissionsTree: async () => {
    const res = await api.get<PermissionGroup[]>('/api/roles/permissions-tree');
    return res.data;
  },

  // Cập nhật danh sách permissions cho 1 role
  updateRolePermissions: async (data: UpdateRolePermissionsPayload) => {
    const res = await api.post<{ message: string }>('/api/roles/update-permissions', data);
    return res.data;
  },
};
