import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginCredentials } from '../models/user.interface';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;
  let localStorageSpy: { [key: string]: string };

  beforeEach(() => {
    // Create a spy object for Router
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    // Mock localStorage
    localStorageSpy = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return localStorageSpy[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      localStorageSpy[key] = value;
    });

    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete localStorageSpy[key];
    });

    spyOn(localStorage, 'clear').and.callFake(() => {
      localStorageSpy = {};
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(AuthService);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store token and user on login with valid credentials', () => {
    const credentials: LoginCredentials = {
      email: 'admin@test.com',
      password: 'admin123'
    };

    const result = service.login(credentials);

    expect(result.success).toBeTruthy();
    expect(result.message).toBe('Login successful');
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', jasmine.any(String));
    expect(localStorage.setItem).toHaveBeenCalledWith('current_user', jasmine.any(String));
    expect(localStorageSpy['auth_token']).toBeDefined();
    expect(localStorageSpy['current_user']).toBeDefined();
  });

  it('should not store token on login with invalid credentials', () => {
    const credentials: LoginCredentials = {
      email: 'wrong@test.com',
      password: 'wrongpassword'
    };

    const result = service.login(credentials);

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Invalid email or password');
    expect(localStorageSpy['auth_token']).toBeUndefined();
  });

  it('should set current user signal on successful login', () => {
    const credentials: LoginCredentials = {
      email: 'admin@test.com',
      password: 'admin123'
    };

    service.login(credentials);

    expect(service.currentUser()).toBeTruthy();
    expect(service.currentUser()?.email).toBe('admin@test.com');
    expect(service.currentUser()?.firstName).toBe('Admin');
  });

  it('should return true for isAuthenticated when token exists', () => {
    localStorageSpy['auth_token'] = 'mock-token';
    localStorageSpy['current_user'] = JSON.stringify({
      id: 1,
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      password: ''
    });

    // Create a new service instance to trigger loadUserFromStorage
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBeTruthy();
  });

  it('should return false for isAuthenticated when no token', () => {
    // localStorage is empty by default in this test
    expect(service.isAuthenticated()).toBeFalsy();
  });

  it('should return false for isAuthenticated after logout', () => {
    const credentials: LoginCredentials = {
      email: 'admin@test.com',
      password: 'admin123'
    };

    service.login(credentials);
    expect(service.isAuthenticated()).toBeTruthy();

    service.logout();
    expect(service.isAuthenticated()).toBeFalsy();
  });

  it('should clear storage on logout', () => {
    const credentials: LoginCredentials = {
      email: 'admin@test.com',
      password: 'admin123'
    };

    service.login(credentials);
    expect(localStorageSpy['auth_token']).toBeDefined();
    expect(localStorageSpy['current_user']).toBeDefined();

    service.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('current_user');
    expect(localStorageSpy['auth_token']).toBeUndefined();
    expect(localStorageSpy['current_user']).toBeUndefined();
  });

  it('should navigate to login page on logout', () => {
    service.logout();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should identify admin role correctly', () => {
    const adminCredentials: LoginCredentials = {
      email: 'admin@test.com',
      password: 'admin123'
    };

    service.login(adminCredentials);

    expect(service.isAdmin()).toBeTruthy();
    expect(service.hasAdminRole()).toBeTruthy();
  });

  it('should identify non-admin role correctly', () => {
    const userCredentials: LoginCredentials = {
      email: 'user@test.com',
      password: 'user123'
    };

    service.login(userCredentials);

    expect(service.isAdmin()).toBeFalsy();
    expect(service.hasAdminRole()).toBeFalsy();
  });

  it('should return false for isAdmin when not authenticated', () => {
    expect(service.isAdmin()).toBeFalsy();
  });

  it('should get stored token', () => {
    const credentials: LoginCredentials = {
      email: 'admin@test.com',
      password: 'admin123'
    };

    service.login(credentials);
    const token = service.getToken();

    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  it('should return null for token when not logged in', () => {
    const token = service.getToken();
    expect(token).toBeNull();
  });

  it('should generate user full name correctly', () => {
    const credentials: LoginCredentials = {
      email: 'admin@test.com',
      password: 'admin123'
    };

    service.login(credentials);

    expect(service.userFullName()).toBe('Admin User');
  });

  it('should return empty string for full name when not authenticated', () => {
    expect(service.userFullName()).toBe('');
  });

  it('should load user from localStorage on initialization', () => {
    const mockUser = {
      id: 1,
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      password: ''
    };

    localStorageSpy['auth_token'] = 'mock-token';
    localStorageSpy['current_user'] = JSON.stringify(mockUser);

    // Create a new service instance to trigger loadUserFromStorage
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);

    expect(service.currentUser()).toBeTruthy();
    expect(service.currentUser()?.email).toBe('admin@test.com');
    expect(service.isAuthenticated()).toBeTruthy();
  });

  it('should handle invalid JSON in localStorage', () => {
    localStorageSpy['auth_token'] = 'mock-token';
    localStorageSpy['current_user'] = 'invalid-json{';

    spyOn(console, 'error');

    // Create a new service instance to trigger loadUserFromStorage
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);

    expect(service.currentUser()).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('should set current user to null on logout', () => {
    const credentials: LoginCredentials = {
      email: 'admin@test.com',
      password: 'admin123'
    };

    service.login(credentials);
    expect(service.currentUser()).toBeTruthy();

    service.logout();
    expect(service.currentUser()).toBeNull();
  });

  it('should use isAuthenticatedUser method', () => {
    expect(service.isAuthenticatedUser()).toBeFalsy();

    const credentials: LoginCredentials = {
      email: 'admin@test.com',
      password: 'admin123'
    };

    service.login(credentials);
    expect(service.isAuthenticatedUser()).toBeTruthy();
  });

  it('should not store password in localStorage', () => {
    const credentials: LoginCredentials = {
      email: 'admin@test.com',
      password: 'admin123'
    };

    service.login(credentials);

    const storedUser = localStorageSpy['current_user'];
    const parsedUser = JSON.parse(storedUser);

    // Password should be empty string, not the actual password
    expect(parsedUser.password).toBe('');
  });

  it('should generate mock token with correct structure', () => {
    const credentials: LoginCredentials = {
      email: 'admin@test.com',
      password: 'admin123'
    };

    service.login(credentials);
    const token = service.getToken();

    expect(token).toBeTruthy();
    // JWT format: header.payload.signature
    expect(token!.split('.').length).toBe(3);
  });
});
