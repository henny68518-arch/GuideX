import { Injectable } from '@angular/core';
import { GuideRegistrationPayload, Int_Guide } from '../Interfaces/int-guide';
import { HttpClient } from '@angular/common/http';
import { Observable, of, lastValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Srv_Guide {
  // המשתנה הבא נשמר לשם תאימות של מנגנוני חיפוש שבנויים כיום סביב mock בזיכרון.
  private mock_Guides: Int_Guide[] = [];

  // מסלול ה-API של הבק-אנד (GuideX, פורט 7098).
  // שים לב: ה-GuideController בשרת מוגדר עם Route("/all_[controller]") —
  // לכן הנתיב הוא /all_guide (ולא /api/Guide).
  private readonly baseUrl = 'https://localhost:7098/all_guide';

  constructor(private http: HttpClient) {}

  /**
   * מחזיר את המדריכים מהשרת (GuideResponseDto).
   * @param ApprovedImports אופציונלי:
   *  true = רק מאושרות, false = רק לא-מאושרות (ממתינות לאישור).
   *  ללא פרמטר (ריק) — לא נשלח query param, והשרת מחזיר את ברירת המחדל שלו.
   */
  GetGuides(ApprovedImports?: boolean): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((guides) => {
        const list = guides ?? [];
        if (ApprovedImports === undefined) {
          return list;
        }
        // סינון בצד הלקוח לפי סטטוס האישור — כך שאין תלות בפרמטר RetrieveApprovals
        // שאינו קיים בהכרח במסלול אליו מתחבר השרת.
        return list.filter((g) => Boolean(g.isApproved) === ApprovedImports);
      }),
      catchError(() => of([])),
    );
  }
  /** מחזיר את המספר הגבוה ביותר של GuideId שנשמר + 1 (ללא קריאה כשהשרת לא זמין → 1). */
  async GetLastGuideId(): Promise<number> {
    try {
      const guides: any[] = (await lastValueFrom(this.http.get<any[]>(this.baseUrl))) ?? [];
      const ids = guides.map((g) => g.guideId);
      return ids.length ? Math.max(...ids) + 1 : 1;
    } catch {
      return 1;
    }
  }

  /**
   * שומר הרשמת מדריכה (User + Guide + קבצים) דרך POST /all_guide/register.
   * בונה FormData (multipart/form-data) לפי GuideUploadDto: פרטי משתמש +
   * ReligiousId + RegionIds ("המקומות שהיא מדריכה בהם") + ResumeFile +
   * CertificateFiles. מחזיר Observable של התשובה הכוללת guideId וגם regionIds.
   */
  addGuide(payload: GuideRegistrationPayload): Observable<any> {
    const valuePayLoad = payload || ({} as GuideRegistrationPayload);
    const formData = new FormData();



    /////////////
///לבדוק מה זה עושה
//////////




    // ── פרטי משתמש (מהם השרת יוצר/מעדכן את ה-User) ──
    if (valuePayLoad.FirstName) formData.append('FirstName', valuePayLoad.FirstName);
    if (valuePayLoad.LastName) formData.append('LastName', valuePayLoad.LastName);
    if (valuePayLoad.IdNumber) formData.append('IdNumber', valuePayLoad.IdNumber);
    if (valuePayLoad.City) formData.append('City', valuePayLoad.City);
    if (valuePayLoad.PhoneNumber) formData.append('PhoneNumber', valuePayLoad.PhoneNumber);
    if (valuePayLoad.Email) formData.append('Email', valuePayLoad.Email);
    if (valuePayLoad.UserPassword) formData.append('UserPassword', valuePayLoad.UserPassword);

    // ── פרטי מדריך ──
    if (valuePayLoad.ReligiousId) formData.append('ReligiousId', String(valuePayLoad.ReligiousId));
    // "מקומות שהיא מדריכה בהם" — אזורי התמחות (ערכים מרובים)
    // מסננים ערכים ריקים/לא-נומריים כדי לא לגרום ל-400 מצד השרת
    // (השרת מחזיר "The value '' is invalid" כש-RegionIds לא תקין).
    (valuePayLoad.RegionIds || [])
      .map((r) => Number(r))
      .filter((r) => Number.isInteger(r) && r > 0)
      .forEach((r) => formData.append('RegionIds', String(r)));

    // ── דיבוג: הדפסת מה שנשלח בפועל ──
    console.log('== RegionIds שנשלחים:', JSON.stringify(valuePayLoad.RegionIds), '| ReligiousId:', valuePayLoad.ReligiousId);
    if (valuePayLoad.RegionIds && valuePayLoad.RegionIds.some((r) => !Number.isFinite(Number(r)) && r !== null && r !== undefined)) {
      console.warn('!! נמצא ערך לא-נומרי/ריק ב-RegionIds:', valuePayLoad.RegionIds);
    }

    // ── קבצים ──
    if (valuePayLoad.ResumeFile) {
      formData.append('ResumeFile', valuePayLoad.ResumeFile, valuePayLoad.ResumeFile.name);
    }
    (valuePayLoad.CertificateFiles || []).forEach((file) =>
      formData.append('CertificateFiles', file, file.name),
    );

    return this.http.post<any>(`${this.baseUrl}/register`, formData).pipe(
      catchError((err) => {
        console.error('שגיאה בשמירת המדריך', err);
        // הדפסת הפרטים של שגיאת ה-400 כדי לראות מה השרת מחזיר (גוף התשובה)
        console.error('סטטוס:', err.status);
        console.error('גוף התשובה מהשרת:', err.error);
        if (err.error && err.error.errors) {
          console.error('פרטי ה-Validation:', JSON.stringify(err.error.errors));
        }
        return of(null);
      }),
    );
  }

  /** בודק אם קיים מדריך עבור userId (תאימות לתבנית הקיימת). */
  userExist(userId: number): boolean {
    return this.mock_Guides.some((g) => g.userId === userId);
  }


  /**
   * מחזיר את מסלול (URL) להורדה/פתיחה של קובץ מדריך לפי ה-FileId.
   * המסלול עקבי עם המסלול בשרת: /all_guide/download/{fileId}.
   */
  getFileUrl(guideFileId: number): string {
    return `${this.baseUrl}/download/${guideFileId}`;
  }

  /** מחזיר את קבצי המדריך מהשרת לפי GuideId (Observable). */
  getGuideFiles(guideId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/files/${guideId}`).pipe(
      catchError(() => of([])),
    );
  }

  /**
   * מאשר מדריכה אחת לפי GuideId (משנה את ערך האישור ל-TRUE בשרת).
   * מחזיר את תשובת השרת; עם שגיאה — null.
   */
  approveGuide(guideId: number): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}/approve/${guideId}`, {})
      .pipe(catchError(() => of(null)));
  }

  /**
   * מבטל אישור של מדריכה לפי GuideId (משנה את ערך האישור ל-FALSE בשרת).
   * מקביל ל-approveGuide — המסלול בשרת: PUT /disapprove/{guideId}.
   * מחזיר את תשובת השרת; עם שגיאה — null.
   */
  disapproveGuide(guideId: number): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}/disapprove/${guideId}`, {})
      .pipe(catchError(() => of(null)));
  }
}
