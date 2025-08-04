import { Usuario, authenticateUser } from './googleSheets';

const AUTH_STORAGE_KEY = 'zy_solutions_user';

export const getCurrentUser = (): { user: Usuario; token: string } | null => {
  const userData = localStorage.getItem(AUTH_STORAGE_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const login = async (email: string, password: string): Promise<{ success: boolean; user?: Usuario; token?: string; error?: string }> => {
  try {
    // Authenticate using Google Sheets
    const user = await authenticateUser(email, password);
    
    if (user) {
      const token = btoa(`${email}:${Date.now()}`); // Simple token generation
      const authData = { user, token };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      return { success: true, user, token };
    } else {
      return { success: false, error: 'Credenciales incorrectas' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Error de conexión' };
  }
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.reload();
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};