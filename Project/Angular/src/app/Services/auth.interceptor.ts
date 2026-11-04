import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service.service';

/**
 * Interceptor כוללני שמצרף את ה-token (JWT) מהמקומלסטורייד
 * לכל בקשה יוצאת לשרת — כדי שלא נצטרך להוסיף את ה-Header
 * בכל שירות בנפרד.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  /** הדומיין של השרת שלנו — רק לו נצרף את ה-token. */
  private readonly apiOrigin = 'localhost:7098';

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // מצרפים את הטוקן רק לבקשות לשרת שלנו.
    // בקשות חיצוניות (למשל hebcal.com) לא אמורות לקבל את ה-Header
    // של Authorization — אחרת הדפדפן חוסם אותן בגלל CORS (ה-header
    // לא נמצא ברשימת Access-Control-Allow-Headers של הצד השלישי).
    const isOurApi = req.url.includes(this.apiOrigin);

    // console.log('🔎 AuthInterceptor → URL:', req.url, '| hasToken:', !!token, '| toOurApi:', isOurApi);

    // אין טוקן, או שזו בקשה חיצונית — שולחים כמו שהיא.
    if (!token || !isOurApi) {
      return next.handle(req);
    }

    // מצרפים את ה-JWT כ-Bearer token.
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });

    return next.handle(authReq);
  }
}
