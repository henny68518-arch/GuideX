import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth-service.service';
import { Permissions } from '../Interfaces/interface-users';

/**
 * Guard הרשאות — מאפשר גישה לנתיב רק אם למשתמש יש את ההרשאה הנתונה.
 * בחתימה משתמשים ב-keyof Permissions כדי ששם ההרשאה יהיה מוגדר-טיפוס.
 */
export function permissionGuard(permission: keyof Permissions): CanActivateFn {
  return (): boolean => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasPermission(permission)) {
      return true;
    }

    router.navigate(['/welcome']);
    return false;
  };
}
