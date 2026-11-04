import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { ServiceUsersService } from '../../../Services/srv-users';
import { AuthService } from '../../../Services/auth-service.service';
import { AdminUser, PermissionDef } from '../../../Interfaces/interface-users';
import { EditUserDetailComponent } from '../../edit-user-detail/edit-user-detail.component';

/**
 * דף ניהול — ניהול הרשאות משתמשים.
 * מציג את כל המשתמשים באתר, ועבור כל אחד את שמו המלא ואת רשימת ההרשאות שלו.
 * בלחיצה על הרשאה — היא מתהפכת (on/off) ונשלח עדכון לשרת.
 */
@Component({
  selector: 'app-user-permissions',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './user-permissions.component.html',
  styleUrl: './user-permissions.component.scss',
})
export class UserPermissionsComponent implements OnDestroy {
  /** כל המשתמשים שנטענו מהשרת. */
  users: AdminUser[] = [];

  /** המשתמשים שמוצגים בטבלה, לאחר הסינון לפי הרשאת המשתמש המחובר ולפי תיבת החיפוש. */
  visibleUsers: AdminUser[] = [];

  /** טקסט החיפוש החופשי — מסנן לפי שם מלא. */
  searchTerm = '';

  isLoading = true;
  errorMessage = '';
  savingKey: string | null = null;
  errorKey: string | null = null;
  updateError = '';
  fading = false;

  private errorTimer: any = null;

  readonly permissions: PermissionDef[] = [
    { key: 'userManagement', label: 'ניהול משתמשים', icon: 'manage_accounts' },
    { key: 'editRoutes', label: 'ניהול מסלולים', icon: 'edit_road' },
    { key: 'editAttractions', label: 'ניהול אטרקציות', icon: 'attractions' },
    { key: 'editHostels', label: 'ניהול מקומות לינה', icon: 'hotel' },
    { key: 'respondInGeneralForum', label: 'הגבה בפורום כללי', icon: 'forum' },
    { key: 'respondInSafetyForum', label: 'הגבה בפורום בטיחות', icon: 'shield' },
    { key: 'canRate', label: 'הרשאת דירוג', icon: 'supervisor_account' },
  ];

  /**
   * נכון רק למנהל ראשי (superAdmin).
   * מי שיש לו הרשאת "ניהול משתמשים" בלבד (ולא superAdmin) לא רואה
   * בכלל את עמודת "ניהול משתמשים" בטבלה — אינו רשאי לנהל את ההרשאה הזו של אחרים.
   */
  showUserManagementColumn = false;

  constructor(
    public serviceUsers: ServiceUsersService,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {
    // העמודה "ניהול משתמשים" מוצגת רק למנהל ראשי (superAdmin).
    this.showUserManagementColumn = this.authService.hasPermission('superAdmin');
    this.loadData();
  }

  /**
   * פותח את פרטי המשתמש בחלון (דיאלוג), במצב צפייה בלבד —
   * מנהל יראה את הפרופיל המלא של המשתמש אבל לא יוכל לשנות אותו כאן.
   */
  openUser(user: AdminUser) {
    this.dialog.open(EditUserDetailComponent, {
      width: '950px',
      height: '850px',
      data: { userId: user.userId, readOnly: true },
    });
  }

  /** טוען את כל המשתמשים מהשרת ומסנן אותם לפי הרשאת המשתמש המחובר. */
  loadData() {
    this.isLoading = true;
    this.errorMessage = '';

    this.serviceUsers.GetAllUsers().subscribe({
      next: (users: any[]) => {
        this.users = (users ?? []).map((u) => u as AdminUser);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('שגיאה בשליפת המשתמשים:', err);
        this.errorMessage = 'אירעה שגיאה בטעינת המשתמשים. נא לנסות שוב.';
        this.isLoading = false;
      },
    });
  }

  /**
   * מסנן את רשימת המשתמשים לפי הרשאת המשתמש המחובר:
   * - אם המחובר הוא SuperAdmin — מציג את כל המשתמשים, חוץ מאלה שגם הם SuperAdmin.
   * - אחרת (UserManagement בלבד) — מציג רק משתמשים שאצלם userManagement = false.
   */
  private filterUsers(users: AdminUser[]): AdminUser[] {
    const currentIsSuperAdmin = this.authService.hasPermission('superAdmin');

    if (currentIsSuperAdmin) {
      return users.filter((u) => !u.superAdmin);
    }
    return users.filter((u) => !u.userManagement);
  }

  /**
   * מחיל את שני הסינונים על רשימת המשתמשים המלאה:
   * סינון לפי הרשאת המנהל המחובר, ולצידו סינון לפי תיבת החיפוש.
   */
  private applyFilters() {
    let result = this.filterUsers(this.users);
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((u) => this.fullName(u).toLowerCase().includes(term));
    }
    this.visibleUsers = result;
  }

  /** מעדכן את תיבת החיפוש ומסנן מחדש את הטבלה. */
  onSearch(value: string) {
    this.searchTerm = value;
    this.applyFilters();
  }

  /** שם מלא של משתמש. */
  fullName(user: AdminUser): string {
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  }

  /** ערך הרשאה נוכחי של משתמש. */
  getValue(user: AdminUser, key: keyof AdminUser): boolean {
    return Boolean(user[key]);
  }

  /** מפתח ייחודי למעקב אחר עדכון הרשאה מסוימת. */
  buildKey(user: AdminUser, permKey: keyof AdminUser): string {
    return `${user.userId}-${String(permKey)}`;
  }

  /**
   * מציגה הודעת שגיאה עדינה ליד הכפתור, והיא נעלמת מעצמה
   * אחרי מספר שניות עם אפקט דהייה.
   */
  showUpdateError(key: string, message: string) {
    this.errorKey = key;
    this.updateError = message;
    this.fading = false;

    // איפוס טיימרים קודמים כדי שהניסיון החדש יאריך את התצוגה מההתחלה.
    clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => {
      this.fading = true; // מתחיל את הדהייה
      this.errorTimer = setTimeout(() => {
        this.errorKey = null;
        this.updateError = '';
        this.fading = false;
      }, 900);
    }, 3000);
  }

  ngOnDestroy() {
    clearTimeout(this.errorTimer);
  }

  /**
   * הפוך הרשאת משתמש: משנה את הערך המקומי ושולח עדכון לשרת.
   * עם הצלחה — נשאר הערך החדש; עם שגיאה — חוזרים לערך הקודם.
   */
  toggle(user: AdminUser, perm: PermissionDef) {
    const key = this.buildKey(user, perm.key);
    if (this.savingKey !== null) return; // כבר מתבצע עדכון אחר
    this.savingKey = key;

    const newValue = !this.getValue(user, perm.key);
    const previousValue = this.getValue(user, perm.key);

    // עדכון אופטימי בתצוגה.
    (user as any)[perm.key] = newValue;
    this.errorKey = null;
    this.updateError = '';

    this.serviceUsers
      .UpdatePermission(user.userId, String(perm.key))
      .subscribe({
        next: (res: any) => {
          this.savingKey = null;
          // catchError החזיר null במקרה של שגיאה — נשחזר את הערך הקודם.
          if (res === null) {
            (user as any)[perm.key] = previousValue;
            this.showUpdateError(key, 'לא הצלחנו לשמור את השינוי. נסו שוב.');
          }
        },
        error: (err: any) => {
          this.savingKey = null;
          (user as any)[perm.key] = previousValue;
          console.error(`שגיאה בעדכון ההרשאה ${String(perm.key)}:`, err);
          this.showUpdateError(key, 'לא הצלחנו לשמור את השינוי. נסו שוב.');
        },
      });
  }
}
