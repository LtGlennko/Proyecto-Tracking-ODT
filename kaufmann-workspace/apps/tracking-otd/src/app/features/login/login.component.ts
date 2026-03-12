import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@kaufmann/shared/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Bienvenido a Tracking ODT</h2>
        <p>Inicie sesión para continuar</p>
        <button class="microsoft-btn" (click)="startLogin()">
          <img src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png" alt="Microsoft Logo" class="ms-logo" />
          <span>Iniciar sesión con Microsoft</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f3f4f6;
      font-family: Arial, sans-serif;
    }
    .login-card {
      background: white;
      padding: 2rem 3rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    .login-card h2 {
      margin-bottom: 0.5rem;
      color: #1f2937;
    }
    .login-card p {
      margin-bottom: 2rem;
      color: #4b5563;
    }
    .microsoft-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0.75rem 1rem;
      background-color: #ffffff;
      border: 1px solid #8c8c8c;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      color: #5e5e5e;
      transition: background-color 0.2s;
    }
    .microsoft-btn:hover {
      background-color: #f3f3f3;
    }
    .ms-logo {
      width: 21px;
      height: 21px;
      margin-right: 0.75rem;
    }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  async startLogin(): Promise<void> {
    await this.authService.startMicrosoftLogin();
  }
}
