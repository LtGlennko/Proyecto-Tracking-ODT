import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@kaufmann/shared/auth';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="loader">Un momento, por favor... Procesando autenticación.</div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: Arial, sans-serif;
      font-size: 1.2rem;
      color: #4b5563;
      background-color: #f3f4f6;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.handleCallback();
  }

  private handleCallback(): void {
    this.route.queryParams.subscribe(async (params) => {
      const error = params['error'];
      if (error) {
        console.error('Login error:', params['error_description']);
        alert('Error en la autenticación: ' + params['error_description']);
        this.router.navigate(['/login']);
        return;
      }

      const code = params['code'];
      if (code) {
        const success = await this.authService.handleMicrosoftCallback(code);
        if (success) {
          this.router.navigate(['/tracking']);
        } else {
          this.router.navigate(['/login']);
        }
      } else {
        // No code, maybe user went here manually
        this.router.navigate(['/login']);
      }
    });
  }
}
