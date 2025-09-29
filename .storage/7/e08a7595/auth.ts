import { User } from '@/types/database';
import { mockDB } from './mockDatabase';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  clientId: string | null;
}

class AuthService {
  private readonly AUTH_KEY = 'legality360_auth';

  getAuthState(): AuthState {
    const stored = localStorage.getItem(this.AUTH_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem(this.AUTH_KEY);
      }
    }
    return {
      isAuthenticated: false,
      user: null,
      clientId: null
    };
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Initialize database if needed
      mockDB.initializeDatabase();
      
      const user = mockDB.getUserByEmail(email);
      
      if (!user) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      // In a real app, you would hash and compare passwords
      if (user.password_hash !== password) {
        return { success: false, error: 'Contraseña incorrecta' };
      }

      if (user.role !== 'cliente') {
        return { success: false, error: 'Acceso solo para clientes' };
      }

      const authState: AuthState = {
        isAuthenticated: true,
        user,
        clientId: user.cliente_id || null
      };

      localStorage.setItem(this.AUTH_KEY, JSON.stringify(authState));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  logout(): void {
    localStorage.removeItem(this.AUTH_KEY);
  }

  getCurrentUser(): User | null {
    return this.getAuthState().user;
  }

  getCurrentClientId(): string | null {
    return this.getAuthState().clientId;
  }

  isAuthenticated(): boolean {
    return this.getAuthState().isAuthenticated;
  }
}

export const authService = new AuthService();