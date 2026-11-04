/**
 * הגדרות הטיפוסים של דף הניהול (אישור מדריכות).
 * ממוקמות בתיקיית ADMIN-PAGE, כך שלא נוגעים בקובץ החיצוני
 * src/app/Interfaces/int-guide.ts.
 */

/** תשובת השרת עבור מדריכה — פרטים מלאים + סטטוס אישור. */
export interface Int_Guide {
  guideId: number;
  userId: number;
  firstName: string;
  lastName: string;
  idNumber: string;
  city: string | null;
  phoneNumber: string | null;
  email: string | null;
  religiousId: number;
  /** אזורי התמחות של המדריכה (regionId). */
  regionId: number[];
  /** שם העדה — נקבע לפי religiousId (רשום בזמן טעינת הנתונים). */
  religiousName?: string;
  /**
   * האם המדריכה אושרה (TRUE = אושרה, אינה מוצגת ברשימת הממתינות).
   * השדה נחשב קיים בצד השרת — נשמר דרך השירות.
   */
  isApproved?: boolean;
}

/** פריט מטא-דאטה של קובץ (קורות חיים / תעודה) מתשובת השרת. */
export interface GuideFileDto {
  GuideFileId: number;
  FileName: string;
  ContentType: string;
  /** "Cv" / "Certificate". */
  Kind: string;
  Size: number;
}

/** פריט קובץ שמוצג בכרטיס — מטא-דאטה + קישור להורדה/פתיחה. */
export interface GuideFileWithUrl {
  fileName: string;
  kind: 'Cv' | 'Certificate';
  /** קישור להורדת תוכן הקובץ מהשרת (לפי תבנית /download/{id}). */
  url: string;
}

/** מדריכה (שטרם אושרה) + רשימת קורות החיים והתעודות שלה. */
export interface GuideWithFiles {
  guide: Int_Guide;
  files: GuideFileWithUrl[];
}
