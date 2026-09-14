export interface Role {
  id: number;
  name: string;
  permissions: string[];
}

export interface PermissionItem {
  name: string;
  value: string;
  description?: string;
}

export interface PermissionGroup {
  groupName: string;
  description: string;
  permissions: PermissionItem[];
}

export interface UpdateRolePermissionsPayload {
  roleName: string;
  permissions: string[];
}
