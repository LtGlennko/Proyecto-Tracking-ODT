import { HttpInterceptorFn } from '@angular/common/http';

// Placeholder: add Bearer token from MSAL when auth is wired up
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // const token = inject(AuthService).getToken();
  // const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(req);
};
