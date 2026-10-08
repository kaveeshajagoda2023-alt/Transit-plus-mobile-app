import { apiClient } from './apiClient';
import { PassengerUser, ConcessionType } from '@/types/auth';

export interface PassengerListResponse {
  success: boolean;
  source?: string;
  data: PassengerUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatePassengerPayload {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  concessionType?: ConcessionType;
  status?: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
  metroPayBalance?: number;
}

export const passengerCrudApi = {
  /**
   * List all registered commuters with search and filtering
   */
  async getAll(params?: {
    search?: string;
    status?: string;
    concessionType?: string;
    page?: number;
    limit?: number;
  }): Promise<PassengerListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.concessionType) query.append('concessionType', params.concessionType);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const qs = query.toString();
    const endpoint = `/api/passengers${qs ? `?${qs}` : ''}`;
    return apiClient.get<PassengerListResponse>(endpoint);
  },

  /**
   * Get single commuter by ID or email
   */
  async getById(id: string): Promise<{ success: boolean; data: PassengerUser }> {
    return apiClient.get<{ success: boolean; data: PassengerUser }>(`/api/passengers/${id}`);
  },

  /**
   * Create new commuter record
   */
  async create(payload: CreatePassengerPayload): Promise<{ success: boolean; data: PassengerUser; message?: string }> {
    return apiClient.post<{ success: boolean; data: PassengerUser; message?: string }>('/api/passengers', payload);
  },

  /**
   * Update commuter profile
   */
  async update(
    id: string,
    updates: Partial<PassengerUser>
  ): Promise<{ success: boolean; data: PassengerUser; message?: string }> {
    return apiClient.patch<{ success: boolean; data: PassengerUser; message?: string }>(
      `/api/passengers/${id}`,
      updates
    );
  },

  /**
   * Delete commuter record permanently
   */
  async delete(id: string): Promise<{ success: boolean; deletedId: string; message: string }> {
    return apiClient.delete<{ success: boolean; deletedId: string; message: string }>(`/api/passengers/${id}`);
  },

  /**
   * Top up commuter digital wallet balance
   */
  async topUpWallet(
    id: string,
    amount: number
  ): Promise<{ success: boolean; balance: number; data: PassengerUser; message: string }> {
    return apiClient.post<{ success: boolean; balance: number; data: PassengerUser; message: string }>(
      `/api/passengers/${id}/top-up`,
      { amount }
    );
  },
};
