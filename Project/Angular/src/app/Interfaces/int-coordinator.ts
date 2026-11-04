

export interface InterfaceCoordinator {
   TourCoordinatorId : number;
   RoleId : number;
   SchoolId : number;
   UserId : number;
}

/** צורת הנתונים שנשלחים לשרת לרישום כורדינטור — תואמת CoordinatorRegisterDto בצד הבק-אנד. */
export interface CoordinatorRegisterPayload {
  // משתמש
  firstName: string;
  lastName: string;
  idNumber: string;
  city?: string; // שם העיר כ-string (ללא טבלת City)
  phoneNumber?: string;
  email: string;
  userPassword: string;

  // כורדינטור
  roleId: number;

  // מוסד — אם קיים שולחים schoolId; אם חדש משאירים null ושולחים נתוני מוסד
  schoolId?: number | null;
  schoolName?: string;
  isBoys?: boolean;
  schoolCity?: string;
  principalName?: string;
  phoneSecretary?: string;
  typeSchoolId?: number;
  ageSchoolId?: number;
}
