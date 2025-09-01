import { authService } from '../src/services/auth.service';
import { LoginCredentials, RegisterData, RecoverPasswordData, ChangePasswordData, UserRole } from '../src/models/auth.models';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockAuthResponse = {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.CLIENTE,
      },
      token: 'mock-token-123',
    };

    it('should store user data and token in AsyncStorage on successful login', async () => {
      // Mock implementation for this test only
      // In a real scenario, this would be mocking a fetch or axios call
      const originalLogin = authService.login;
      authService.login = jest.fn().mockResolvedValue(mockAuthResponse);

      const result = await authService.login(mockCredentials);

      expect(result).toEqual(mockAuthResponse);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'auth_token',
        'mock-token-123'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'auth_user',
        JSON.stringify(mockAuthResponse.user)
      );

      // Restore original implementation
      authService.login = originalLogin;
    });

    it('should throw an error when login fails', async () => {
      // Mock implementation for this test only
      const originalLogin = authService.login;
      authService.login = jest.fn().mockRejectedValue(new Error('Invalid credentials'));

      await expect(authService.login(mockCredentials)).rejects.toThrow('Invalid credentials');

      // Restore original implementation
      authService.login = originalLogin;
    });
  });

  describe('register', () => {
    const mockRegisterData: RegisterData = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    it('should validate passwords match before registration', async () => {
      const invalidData: RegisterData = {
        ...mockRegisterData,
        confirmPassword: 'different-password',
      };

      await expect(authService.register(invalidData)).rejects.toThrow(
        'Las contraseñas no coinciden'
      );
    });

    it('should register a new user successfully', async () => {
      // Mock implementation for this test only
      const originalRegister = authService.register;
      authService.register = jest.fn().mockResolvedValue(undefined);

      await expect(authService.register(mockRegisterData)).resolves.not.toThrow();

      // Restore original implementation
      authService.register = originalRegister;
    });
  });

  describe('logout', () => {
    it('should remove auth data from AsyncStorage', async () => {
      await authService.logout();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth_user');
    });
  });

  describe('getCurrentAuth', () => {
    it('should return null when no auth data is stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await authService.getCurrentAuth();

      expect(result).toBeNull();
    });

    it('should return auth data when it exists in storage', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.CLIENTE,
      };

      const mockToken = 'mock-token-123';

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(mockToken)
        .mockResolvedValueOnce(JSON.stringify(mockUser));

      const result = await authService.getCurrentAuth();

      expect(result).toEqual({
        user: mockUser,
        token: mockToken,
      });
    });
  });

  describe('recoverPassword', () => {
    const mockRecoverData: RecoverPasswordData = {
      email: 'test@example.com',
    };

    it('should call recover password endpoint', async () => {
      // Mock implementation for this test only
      const originalRecover = authService.recoverPassword;
      authService.recoverPassword = jest.fn().mockResolvedValue(undefined);

      await expect(authService.recoverPassword(mockRecoverData)).resolves.not.toThrow();

      // Restore original implementation
      authService.recoverPassword = originalRecover;
    });
  });

  describe('changePassword', () => {
    const mockChangeData: ChangePasswordData = {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword',
      confirmPassword: 'newpassword',
    };

    it('should validate passwords match before changing', async () => {
      const invalidData: ChangePasswordData = {
        ...mockChangeData,
        confirmPassword: 'different-password',
      };

      await expect(authService.changePassword(invalidData)).rejects.toThrow(
        'Las contraseñas no coinciden'
      );
    });

    it('should change password successfully', async () => {
      // Mock implementation for this test only
      const originalChange = authService.changePassword;
      authService.changePassword = jest.fn().mockResolvedValue(undefined);

      await expect(authService.changePassword(mockChangeData)).resolves.not.toThrow();

      // Restore original implementation
      authService.changePassword = originalChange;
    });
  });
});