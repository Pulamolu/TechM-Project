import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { environment } from '../../environments/environment';

interface PasswordResetRequest { email: string }
interface ResetPasswordPayload { token: string; password: string; confirmPassword: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'tm_token';
  private readonly emailKey = 'tm_email';

  currentUserEmail = signal<string | null>(localStorage.getItem(this.emailKey));

  constructor(private http: HttpClient, private router: Router) {}

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  requestPasswordReset(payload: PasswordResetRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/request-reset`, payload);
  }

  resetPassword(payload: ResetPasswordPayload): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, payload);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.emailKey);
    this.currentUserEmail.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.emailKey, res.email);
    this.currentUserEmail.set(res.email);
  }
}
