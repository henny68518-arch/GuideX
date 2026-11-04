/**
 * תשובת GET /all_Guide מהשרת — פרטי מדריכה מלאים.
 * השדות מגיעים ב-camelCase, התואמים לתשובת השרת בפועל,
 * למשל: { guideId, userId, firstName, lastName, idNumber, city,
 *        phoneNumber, email, religiousId, regionId }.
 */
export interface Int_Guide {
  guideId: number;
  userId: number;
  firstName: string;
  lastName: string;
  idNumber: string;
  city: string;
  phoneNumber: string;
  email: string;
  religiousId: number;
  /** אזורי ההתמחות של המדריכה (regionId). */
  regionId: number[];
  /** שם העדה — נקבע לפי religiousId (רשום בזמן טעינת הנתונים). */
  religiousName?: string;
}

/** פריט קובץ בתשובת השרת — המטא-דאטה בלבד (שם, סוג, מזהה, גודל). */
export interface GuideFileDto {
  GuideFileId: number;
  FileName: string;
  ContentType: string;
  /** "Cv" / "Certificate". */
  Kind: string;
  Size: number;
}

/**
 * תוכן טופס ההרשמה שנשלח ל-POST /all_guide/register (multipart/form-data).
 * השדות תואמים ל-GuideUploadDto שבצד השרת. השרת מקבל כאן את ALL הנתונים —
 * פרטי המשתמש + פרטי המדריך (עדה, אזורי התמחות) + קבצים — ויוצר/מעדכן
 * את ה-User וה-Guide ב-SQL.
 */
export interface GuideRegistrationPayload {
  ReligiousId: number;
  RegionIds: number[];
  FirstName: string;
  LastName: string;
  IdNumber: string;
  City: string;
  PhoneNumber: string;
  Email: string;
  UserPassword: string;
  ResumeFile?: File | null;
  CertificateFiles?: File[];
}
