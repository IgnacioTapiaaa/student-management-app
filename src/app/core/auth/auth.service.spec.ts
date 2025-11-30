import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AuthService } from './auth.service';
import { LoginCredentials } from '../models/user.interface';
import { AppState } from '../../store/app.state';
import * as AuthSelectors from '../../store/auth/auth.selectors';

describe('AuthService', () => {
  let service: AuthService;
  let store: MockStore<AppState>;
  let routerSpy: jasmine.SpyObj<Router>;
  let localStorageSpy: { [key: string]: string };

  const initialState: AppState = {
    auth: {
      currentUser: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null
    },
    ui: {
      toolbarTitle: 'Student Management System',
      sidenavOpened: true
    },
    students: {
      ids: [],
      entities: {},
      selectedStudentId: null,
      loading: false,
      error: null,
      loaded: false
    },
    courses: {
      ids: [],
      entities: {},
      selectedCourseId: null,
      loading: false,
      error: null,
      loaded: false
    },
    inscriptions: {
      ids: [],
      entities: {},
      selectedInscriptionId: null,
      loading: false,
      error: null,
      loaded: false
    },
    users: {
      ids: [],
      entities: {},
      selectedUserId: null,
      loading: false,
      error: null,
      loaded: false
    }
  };

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
        { provide: Router, useValue: routerSpyObj },
        provideMockStore({ initialState })
      ]
    });

    service = TestBed.inject(AuthService);
    store = TestBed.inject(MockStore);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Spy on store dispatch
    spyOn(store, 'dispatch');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should dispatch login action when login is called', () => {
    const credentials: LoginCredentials = {
      email: 'admin@test.com',
      password: 'admin123'
    };

    service.login(credentials);

    expect(store.dispatch).toHaveBeenCalled();
  });

  it('should dispatch logout action when logout is called', () => {
    service.logout();

    expect(store.dispatch).toHaveBeenCalled();
  });

  it('should return token from localStorage', () => {
    localStorageSpy['auth_token'] = 'mock-token';

    const token = service.getToken();

    expect(token).toBe('mock-token');
  });

  it('should return null when no token in localStorage', () => {
    const token = service.getToken();

    expect(token).toBeNull();
  });

  it('should provide currentUser$ observable', (done) => {
    service.currentUser$.subscribe(user => {
      expect(user).toBeNull();
      done();
    });
  });

  it('should provide isAuthenticated$ observable', (done) => {
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBeFalse();
      done();
    });
  });

  it('should provide isAdmin$ observable', (done) => {
    service.isAdmin$.subscribe(isAdmin => {
      expect(isAdmin).toBeFalse();
      done();
    });
  });

  it('should have backward compatible signal-based API', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.isAdmin()).toBeFalse();
    expect(service.userFullName()).toBe('');
  });

  it('should dispatch clearAuthError action when clearError is called', () => {
    service.clearError();

    expect(store.dispatch).toHaveBeenCalled();
  });

  it('should dispatch loadUserFromStorage action when loadUserFromStorage is called', () => {
    // Reset the spy since constructor already dispatched it
    (store.dispatch as jasmine.Spy).calls.reset();

    service.loadUserFromStorage();

    expect(store.dispatch).toHaveBeenCalled();
  });

  it('should return authentication status from isAuthenticatedUser', () => {
    expect(service.isAuthenticatedUser()).toBeFalse();
  });

  it('should return admin status from hasAdminRole', () => {
    expect(service.hasAdminRole()).toBeFalse();
  });
});
