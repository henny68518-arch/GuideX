import { Injectable } from '@angular/core';
import { Int_Hostels, Int_HostelFile } from '../Interfaces/Int_Hostels';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class srv_Hostels {
  constructor(public http: HttpClient) {}

  private baseUrl = 'https://localhost:7098/Hostels';

  GetHostels() {
    return this.http.get<Int_Hostels[]>(this.baseUrl).pipe(
      // מיפוי מנתוני השרת לאובייקט Int_Hostels — השרת (.NET) מחזיר בדרך כלל
      // שמות שדות בקמאל-קייס (hostelsId, hostelsName...), ולכן אנחנו מתרגמים
      // אותם לשמות הפסקל-קייס שהטמפלייט והקוד מצפים להם.
      map((hostels: any[]) =>
        (hostels || []).map((h: any) => ({
          HostelsId: h.HostelsId ?? h.hostelsId,
          HostelsName: h.HostelsName ?? h.hostelsName ?? '',
          regionId: h.regionId ?? h.regionId ?? 0,
          Address: h.Address ?? h.address ?? '',
          Description: h.Description ?? h.description ?? '',
          NumberOfPlaces: h.NumberOfPlaces ?? h.numberOfPlaces ?? 0,
          kashrutId: h.kashrutId ?? h.kashrutID ?? 0,
          Phone: h.Phone ?? h.phone ?? '',
        })),
      ),
    );
  }

  UpdateHostel(hostel: Int_Hostels): Observable<void> {
    console.log(hostel);
    return this.http
      .put<void>(`${this.baseUrl}/${hostel.HostelsId}`, hostel)
      .pipe(
        catchError((error) => {
          console.error('Error updating hostel:', error);
          return of();
        }),
      );
  }

  AddNewHostel(hostel: Int_Hostels): Observable<any> {
    console.log(hostel);
    // מחזיר את מקום הלינה החדש שנשמר (כולל ה- HostelsId שנוצר בשרת),
    // כדי שנוכל להעלות אליו תמונות אחרי השמירה.
    return this.http
      .post<any>(`${this.baseUrl}/new`, hostel)
      .pipe(
        catchError((error) => {
          console.error('Error adding hostel:', error);
          return of();
        }),
      );
  }

  deleteHostel(hostelId: number) {
    return this.http
      .delete<void>(`${this.baseUrl}/${hostelId}`)
      .pipe(
        catchError((error) => {
          console.error('בעיה במחיקת מקום לינה:', error);
          return of();
        }),
      );
  }


  // ─────────── תמונות מקום לינה ───────────

  /** מחזיר את רשימת התמונות (מטא-דאטה) של מקום לינה לפי ID. */
  GetImages(hostelId: number): Observable<Int_HostelFile[]> {
    return this.http
      .get<Int_HostelFile[]>(`${this.baseUrl}/${hostelId}/images`)
      .pipe(catchError(() => of([])));
  }

  /** מעלה תמונה/ות (File[]) למקום לינה לפי ID — via multipart/form-data. מחזיר את הרשימה המעודכנת. */
  AddImages(hostelId: number, files: File[]): Observable<Int_HostelFile[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file, file.name));
    return this.http
      .post<Int_HostelFile[]>(`${this.baseUrl}/${hostelId}/images`, formData)
      .pipe(catchError(() => of([])));
  }

  /** מוחק תמונה לפי FileId. */
  DeleteImage(fileId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/file/${fileId}`)
      .pipe(catchError(() => of()));
  }

  /** כתובת URL לשליפת תוכן התמונה (לקריאת ה- src של <img>). */
  ImageUrl(fileId: number): string {
    return `${this.baseUrl}/file/${fileId}`;
  }
}
