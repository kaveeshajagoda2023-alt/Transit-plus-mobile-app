// The physical Samsung phone must use the Windows PC's reachable LAN address.
// This address was verified from the connected PC network adapter.
export const API_BASE_URL = 'http://192.168.8.170:5000/api';

const requestJson = async (path, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      timeout: 15000,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || 'The server returned an error');
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to TransitPulse server. Please check your connection and try again.');
    }
    throw error;
  }
};

export const checkApiHealth = () => requestJson('/health');

// 1. Process simulated online payment
export const processPayment = async (paymentData) => {
  return requestJson('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

// 2. Create Digital Ticket
export const createTicket = async (ticketData) => {
  return requestJson('/tickets', {
    method: 'POST',
    body: JSON.stringify(ticketData),
  });
};

// 3. Get User Ticket Purchase History
export const getUserTickets = async (userId) => {
  return requestJson(`/tickets/user/${userId}`);
};

// 4. Get Single Ticket Details by ID
export const getTicketById = async (id) => {
  return requestJson(`/tickets/${id}`);
};

// 5. Update Ticket Status (Active -> Used/Expired/Cancelled)
export const updateTicketStatus = async (id, ticketStatus) => {
  return requestJson(`/tickets/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ ticketStatus }),
  });
};

export const cancelTicket = async (id) => {
  return updateTicketStatus(id, 'Cancelled');
};

export const validateQrTicket = async (ticketId) => {
  return requestJson('/tickets/validate-qr', {
    method: 'POST',
    body: JSON.stringify({ ticketId }),
  });
};
