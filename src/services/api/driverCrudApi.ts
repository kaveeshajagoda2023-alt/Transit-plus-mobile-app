import { apiClient } from './apiClient';
import { StaffUser, StaffRole, StaffAccountStatus } from '@/types/staff';

export interface DriverListResponse {
  success: boolean;
  source?: string;
  data: StaffUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateDriverPayload {
  name: string;
  email: string;
  staffId?: string;
  phone?: string;
  role?: StaffRole;
  status?: StaffAccountStatus;
  assignedVehicle?: string;
  dispatchZone?: string;
  badgeLabel?: string;
  shiftHours?: string;
  password?: string;
  pin?: string;
}

export const driverCrudApi = {
  /**
   * List all drivers and transit staff with filtering and search
   */
  async getAll(params?: {
    search?: string;
    role?: string;
    status?: string;
    dispatchZone?: string;
    page?: number;
    limit?: number;
  }): Promise<DriverListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.role) query.append('role', params.role);
    if (params?.status) query.append('status', params.status);
    if (params?.dispatchZone) query.append('dispatchZone', params.dispatchZone);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const qs = query.toString();
    const endpoint = `/api/drivers${qs ? `?${qs}` : ''}`;
    return apiClient.get<DriverListResponse>(endpoint);
  },

  /**
   * Get single driver profile by ID or Staff ID
   */
  async getById(id: string): Promise<{ success: boolean; data: StaffUser }> {
    return apiClient.get<{ success: boolean; data: StaffUser }>(`/api/drivers/${id}`);
  },

  /**
   * Create new driver / operator profile
   */
  async create(payload: CreateDriverPayload): Promise<{ success: boolean; data: StaffUser; message?: string }> {
    return apiClient.post<{ success: boolean; data: StaffUser; message?: string }>('/api/drivers', payload);
  },

  /**
   * Update driver profile details
   */
  async update(
    id: string,
    updates: Partial<StaffUser>
  ): Promise<{ success: boolean; data: StaffUser; message?: string }> {
    return apiClient.patch<{ success: boolean; data: StaffUser; message?: string }>(`/api/drivers/${id}`, updates);
  },

  /**
   * Delete driver profile permanently
   */
  async delete(id: string): Promise<{ success: boolean; deletedId: string; message: string }> {
    return apiClient.delete<{ success: boolean; deletedId: string; message: string }>(`/api/drivers/${id}`);
  },

  /**
   * Reassign fleet vehicle to driver
   */
  async assignVehicle(
    id: string,
    vehicleNumber: string
  ): Promise<{ success: boolean; data: StaffUser; message: string }> {
    return apiClient.post<{ success: boolean; data: StaffUser; message: string }>(
      `/api/drivers/${id}/assign-vehicle`,
      { vehicleNumber }
    );
  },

  /**
   * Switch driver operational duty status
   */
  async switchDutyStatus(
    id: string,
    status: 'ACTIVE' | 'OFF_DUTY' | 'SUSPENDED'
  ): Promise<{ success: boolean; data: StaffUser; message: string }> {
    return apiClient.post<{ success: boolean; data: StaffUser; message: string }>(
      `/api/drivers/${id}/duty-status`,
      { status }
    );
  },
};
