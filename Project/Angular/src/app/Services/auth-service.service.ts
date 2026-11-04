import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Permissions } from '../Interfaces/interface-users';

export interface UserData {
  email: string;
  userId: string;
  firstName: string;
  permission: Permissions | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private router: Router) {}

  login(token: string) {
    const decoded: any = jwtDecode(token);

 
    // ✅ parse את ה-Permission — זה יכול לבוא מהשרת באחד מהפורמטים:
    //   - כמחרוזת JSON
    //   - כבר כאובייקט (הרשימה המלאה של ההרשאות)
    //   - כמערך של שמות־הרשאות (למשל ["UserManagement","EditRoutes"])
    // כדי שלא להיות תלוי בשם ובפורמט של השדה, מחפשים אותו במפתחות אפשריים.
    let permissionObj: Permissions | null = null;
    const rawPermissions =
      decoded.Permissions ??
      decoded.Permission ??
      decoded.permissions ??
      decoded.permission;
    if (rawPermissions) {
      // א) string — מנסים לפרס כמהחרוזת JSON
      if (typeof rawPermissions === 'string') {
        try {
          permissionObj = JSON.parse(rawPermissions);
        } catch (error) {
          console.error('שגיאה בפרסום ההרשאות:', error);
        }
      }
      // ב) מערך של שמות־הרשאות — הופך ל-object עם true לכל הרשאה
      else if (Array.isArray(rawPermissions)) {
        permissionObj = {} as Permissions;
        for (const name of rawPermissions) {
          (permissionObj as any)[name] = true;
        }
      }
      // ג) אובייקט — משתמשים בו כמו שהוא
      else if (typeof rawPermissions === 'object') {
        permissionObj = rawPermissions;
      }
      console.log('permissionObj אחרי פירסור:', permissionObj);

      // ✅ מנרמל את המפתחות ל-camelCase (כי השרת עלול לשלוח PascalCase)
      //   ולתרגם מפתחות עם קו תחתון/מקף ל-camelCase.
      if (permissionObj && !Array.isArray(permissionObj)) {
        const normalized: any = {};
        for (const [key, val] of Object.entries(permissionObj)) {
          if (typeof val !== 'boolean') continue; // דברים שאינם הרשאות — מדלגים
          const camel = key
            .replace(/[-_](.)/g, (_m, c: string) => c.toUpperCase());
          const firstLower =
            camel.charAt(0).toLowerCase() + camel.slice(1);
          normalized[firstLower] = val;
        }
        permissionObj = normalized;
      }
    } else {
      console.warn('אין שדה Permissions ב-JWT! מפתחות ה-decoded:', Object.keys(decoded));
    }


    const userObj: UserData = {
      email: decoded.Email,          // שים לב למפתחות בפועל!
      userId: decoded.UserId,        // תיקנתי מ-UserId ל-userId
      firstName: decoded.FirstName,  // תיקנתי מ-FirstName ל-firstName
      permission : permissionObj,  // הוספתי את ההרשאות
    };


    localStorage.setItem('token', token);        // שמירת הטוקן לשימוש עתידי
    localStorage.setItem('user_data', JSON.stringify(userObj));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isTokenExpired(token: string): boolean {
    const decoded: any = jwtDecode(token);
    if (!decoded.exp) return false;              // אם אין תאריך תפוגה - מניח שתקין
    return Date.now() >= decoded.exp * 1000;     // exp בשניות
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  logout() {
    localStorage.removeItem('user_data');
    localStorage.removeItem('token');
    this.router.navigate(['']);
  }

  getUserData(): UserData | null {
    try {
      const savedData = localStorage.getItem('user_data');
      return savedData ? JSON.parse(savedData) as UserData : null;
    } catch (error) {
      console.error('שגיאה בהמרת המשתמש מה-LOCALSTORAGE:', error);
      return null;
    }
  }

   hasPermission(permission: keyof Permissions): boolean {
    const userData = this.getUserData();
    const value = userData?.permission?.[permission];
    const result = typeof value === 'boolean' ? value : false;
    // if (!result) {
    //   console.warn(
    //     `hasPermission('${permission}') → false. ` +
    //       `המשתמש ב-localStorage:`,
    //     userData,
    //   );
    // }
    return result;
  }
}
