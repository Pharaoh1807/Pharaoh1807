const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = {
  async getProducts(page = 1, limit = 12, search = '') {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
    return res.json();
  },
  async getProductById(id) {
    const res = await fetch(`${API_URL}/api/products/${id}`);
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch product');
    }
    return res.json();
  },
  async generateVietQR(productId, quantity = 1, token) {
    const res = await fetch(`${API_URL}/api/vietqr/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Gửi token xác thực
      },
      body: JSON.stringify({ productId, quantity })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to generate QR code');
    }
    return res.json();
  },

  async deletetransaction(transactionId) {
    const token = localStorage.getItem('user_token');
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }
    const res = await fetch(`${API_URL}/api/transactions/${transactionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete transaction');
    }
    return res.json();
  },

  async checkTransactionStatus(transactionId) {
    const res = await fetch(`${API_URL}/api/transactions/status/${transactionId}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to check status');
    }
    return res.json();
  },

  async notifyPaymentSent(transactionId) {
    const token = localStorage.getItem('user_token');
    if (!token) {
      // Ném lỗi nếu người dùng chưa đăng nhập
      throw new Error('Authentication required. Please log in.');
    }
    const res = await fetch(`${API_URL}/api/vietqr/notify-payment/${transactionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to notify payment.');
    }
    return res.json();
  },

  async mockConfirmPayment(transactionId) {
    const res = await fetch(`${API_URL}/api/transactions/confirm-mock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to confirm payment');
    }
    return res.json();
  },

  // User Authentication
  async userLogin(email, password) {
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }
    return res.json();
  },

  async userRegister(name, email, password) {
    const res = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Registration failed');
    }
    return res.json();
  },

  async getUserOrders(token, page = 1, limit = 5, search = '', status = 'all', sort = 'newest') {
    const params = new URLSearchParams({ page, limit, status, sort });
    if (search) params.append('search', search);

    const res = await fetch(`${API_URL}/api/users/orders?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch orders');
    }
    return res.json();
  },

  async verifyUserToken(token) {
    const res = await fetch(`${API_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error('User token is invalid or expired');
    }
    return res.json();
  },

  async getAdminUsers(token, page = 1, limit = 5) {
    const res = await fetch(`${API_URL}/api/admin/users?page=${page}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch users');
    }
    return res.json();
  },

  async adminUpdateUser(token, id, payload) {
    const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update user');
    }
    return res.json();
  },

  async adminDeleteUser(token, id) {
    const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete user');
    }
    return res.json();
  },

  async adminLogin(email, password) {
    const res = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify({ email, password })
      body: JSON.stringify({ email, password}) // Ensure this matches the backend route
     
    });
    
    if (!res.ok) throw new Error('Login failed');
   
    return res.json();
  },



  async getAdminProductsStats(token) {
    const res = await fetch(`${API_URL}/api/admin/products/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  async adminList(token, page = 1, limit = 10) {
    const res = await fetch(`${API_URL}/api/admin/products?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  async adminCreate(token, payload) {
    const res = await fetch(`${API_URL}/api/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  async adminGetProduct(token, id) {
    const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },

  async getProductHistory (token, productId, activeFilters, page = 1, limit = 15) {
    const url = new URL(`${API_URL}/api/admin/products/${productId}/history`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);

    //them query params
    if (activeFilters) {
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value);
        }
      });
    }
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to fetch product history');
    return res.json();
  },

  async adjustProductStock (token, productId, payload) {
    const res = await fetch(`${API_URL}/api/admin/products/${productId}/stock`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to fetch product history');
    return res.json();
  },

  async adminUpdate(token, id, payload) {
    const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  async adminDelete(token, id) {
    const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async uploadImage(token, file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData // Let browser set Content-Type header
    });
    
    if (!res.ok) {
      let errorMsg = 'Image upload failed';
      try {
        const errData = await res.json();
        if (errData.error) errorMsg = errData.error;
      } catch (e) {
        console.error('Could not parse backend error as JSON', e);
      }
      throw new Error(errorMsg);
    }
    
    return res.json();
  },

  async verifyAdminToken(token) {
    const res = await fetch(`${API_URL}/api/admin/verify-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error('Token is invalid or expired');
    }
    return res.json();
  },

  async getAdminTransactions(token, page = 1, limit = 15, status = 'all') {
    const res = await fetch(`${API_URL}/api/admin/transactions?page=${page}&limit=${limit}&status=${status}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch transactions');
    }
    return res.json();
  },

  async getAdminTransactionsStats(token) {
    const res = await fetch(`${API_URL}/api/admin/transactions/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch transaction stats');
    return res.json();
  },

  async getAdminTransactionsUserStats(token, page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);

    const res = await fetch(`${API_URL}/api/admin/transactions/user-stats?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user transaction stats');
    return res.json();
  },

  async confirmAdminTransaction(token, transactionId) {
    const res = await fetch(`${API_URL}/api/admin/transactions/${transactionId}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to confirm transaction.');
    }
    return res.json();
  },
};
