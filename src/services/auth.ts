
import { API_CONFIG, STORAGE_KEYS } from '@/lib/constants';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

interface User {
  user_id: string;
  email: string;
  name?: string;
  avatar?: string;
  subscription?: string;
  created_at: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

class AuthService {
  private getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
    return data;
  }

  async register(userData: RegisterData): Promise<{ message: string; user_id: string }> {
    const formData = new FormData();
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    if (userData.name) {
      formData.append('name', userData.name);
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return await response.json();
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_ME}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const user = await response.json();
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    return user;
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getStoredUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }
}

export const authService = new AuthService();
export type { User, LoginCredentials, RegisterData };
