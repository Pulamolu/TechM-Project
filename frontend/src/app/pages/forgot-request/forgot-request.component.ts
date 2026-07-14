import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-request.component.html',
  styleUrls: ['./forgot-request.component.css']
})
export class ForgotRequestComponent {
  form!: FormGroup;
  loading = false;
  message = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.message = '';
    this.authService.requestPasswordReset({ email: this.form.value.email! }).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'If this email exists, we sent reset instructions.';
      },
      error: () => {
        this.loading = false;
        this.message = 'If this email exists, we sent reset instructions.';
      }
    });
  }
}
