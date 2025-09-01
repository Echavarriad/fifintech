import React from 'react';
import { render, act, waitFor, renderHook } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { authService } from '../src/services/auth.service';
import { LoginCredentials, UserRole } from '../src/models/auth.models';

// Mock auth service
jest.mock('../src/services/auth.service', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentAuth: jest.fn(),
    changePassword: jest.fn(),
  },
}));

const mockAuthResponse = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.CLIENTE,
  },
  token: 'mock-token-123',
};

const mockCredentials: LoginCredentials = {
  email: 'test@example.com',
  password: 'password123',
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.authState.isLoading).toBe(true);
    expect(result.current.authState.isLoggedIn).toBe(false);
    expect(result.current.authState.user).toBeNull();
    expect(result.current.authState.token).toBeNull();
    expect(result.current.authState.error).toBeNull();
  });

  it('should check for existing auth on mount', async () => {
    (authService.getCurrentAuth as jest.Mock).mockResolvedValueOnce(mockAuthResponse);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initial state is loading
    expect(result.current.authState.isLoading).toBe(true);

    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.authState.isLoading).toBe(false);
    });

    expect(result.current.authState.isLoggedIn).toBe(true);
    expect(result.current.authState.user).toEqual(mockAuthResponse.user);
    expect(result.current.authState.token).toEqual(mockAuthResponse.token);
  });

  it('should handle login success', async () => {
    (authService.login as jest.Mock).mockResolvedValueOnce(mockAuthResponse);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login(mockCredentials);
    });

    expect(authService.login).toHaveBeenCalledWith(mockCredentials);
    expect(result.current.authState.isLoggedIn).toBe(true);
    expect(result.current.authState.user).toEqual(mockAuthResponse.user);
    expect(result.current.authState.token).toEqual(mockAuthResponse.token);
    expect(result.current.authState.error).toBeNull();
  });

  it('should handle login failure', async () => {
    const errorMessage = 'Invalid credentials';
    (authService.login as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login(mockCredentials);
      } catch (error) {
        // Expected error
      }
    });

    expect(authService.login).toHaveBeenCalledWith(mockCredentials);
    expect(result.current.authState.isLoggedIn).toBe(false);
    expect(result.current.authState.user).toBeNull();
    expect(result.current.authState.token).toBeNull();
    expect(result.current.authState.error).toBe(errorMessage);
  });

  it('should handle logout', async () => {
    // First set up a logged in state
    (authService.getCurrentAuth as jest.Mock).mockResolvedValueOnce(mockAuthResponse);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the initial auth check to complete
    await waitFor(() => {
      expect(result.current.authState.isLoading).toBe(false);
    });

    // Now test logout
    await act(async () => {
      await result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(result.current.authState.isLoggedIn).toBe(false);
    expect(result.current.authState.user).toBeNull();
    expect(result.current.authState.token).toBeNull();
  });

  it('should get user role correctly', async () => {
    // Set up a logged in state with a specific role
    (authService.getCurrentAuth as jest.Mock).mockResolvedValueOnce(mockAuthResponse);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the initial auth check to complete
    await waitFor(() => {
      expect(result.current.authState.isLoading).toBe(false);
    });

    expect(result.current.getUserRole()).toBe(UserRole.CLIENTE);

    // Test with no user
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.getUserRole()).toBeNull();
  });

  it('should clear error state', async () => {
    // First create an error state
    const errorMessage = 'Test error';
    (authService.login as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login(mockCredentials);
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.authState.error).toBe(errorMessage);

    // Now clear the error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.authState.error).toBeNull();
  });
});