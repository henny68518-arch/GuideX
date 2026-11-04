export interface InterfaceUsers {
    UserId : number;
   UserPassword : string;
   FirstName : string;
   LastName : string;
   IdNumber : string;
   CityId : number;
   PhoneNumber : string;
   Email : string;
}

/**
 * משתמש מהשרת (GET /Users) — כולל פרטי המשתמש ושדות ההרשאות.
 * השדות מופיעים בתשובת השרת באיות camelCase.
 */
export interface AdminUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  superAdmin: boolean;
  userManagement: boolean;
  editRoutes: boolean;
  editAttractions: boolean;
  editHostels: boolean;
  respondInGeneralForum: boolean;
  respondInSafetyForum: boolean;
  canRate: boolean;
}

/** תיאור של הרשאה אחת — לתצוגה ולעדכון. */
export interface PermissionDef {
  key: keyof AdminUser;
  label: string;
  icon: string;
}

/**
 * הרשאות האפליקציה — מגיעות מהשרת בתוך ה-JWT (שדה `Permissions`).
 * מפתחות אלה הם ההרשאות בפועל שמותר לבדוק עם `hasPermission`.
 */
export interface Permissions {
  superAdmin: boolean;
  userManagement: boolean;
  editRoutes: boolean;
  editAttractions: boolean;
  editHostels: boolean;
  respondInGeneralForum: boolean;
  respondInSafetyForum: boolean;
  canRate: boolean;
}
