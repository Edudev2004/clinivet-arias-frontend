import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  sessionExpired = signal<boolean>(false);

  // Aquí está el formulario actualizado con el checkbox
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false] 
  });

  ngOnInit(): void {
    const isExpirado = this.route.snapshot?.queryParamMap?.get('expirado') === 'true' ||
      !!this.authService.sessionExpiredMessage();
    if (isExpirado) {
      this.sessionExpired.set(true);
    }
  }

  toggleShowPassword(): void {
    this.showPassword.update((val) => !val);
  }

  handleQuickFill(roleEmail: string): void {
    this.loginForm.patchValue({
      email: roleEmail,
      password: 'Admin123!'
    });
    this.errorMessage.set(null);
    this.sessionExpired.set(false);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.sessionExpired.set(false);

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password!, password_hash: password! }).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Credenciales incorrectas. Verifica tu correo y contraseña.');
        } else if (err.status === 403) {
          this.errorMessage.set('Tu cuenta está desactivada. Contacta al administrador.');
        } else if (err.status === 0) {
          this.errorMessage.set('No se pudo conectar con el servidor (backend apagado en el puerto 8080).');
        } else {
          this.errorMessage.set('Ocurrió un error al procesar el inicio de sesión.');
        }
      }
    });
  }
}