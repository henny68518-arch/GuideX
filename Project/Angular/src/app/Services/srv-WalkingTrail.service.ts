import { Injectable } from '@angular/core';
import { Int_WalkingTrail, Int_WalkingTrailFile } from '../Interfaces/Int_WalkingTrail';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SrvWalkingTrailService {
  constructor(public http: HttpClient) {}
  private baseUrl = 'https://localhost:7098/WakingTrail';
  //  public mock_WalkingTrails: Int_WalkingTrail[] = [
 


  GetWalkingTrails() {
    return this.http.get<Int_WalkingTrail[]>(this.baseUrl).pipe(
      // מיפוי מנתוני השרת לאובייקט Int_WalkingTrail — השרת (.NET) מחזיר בדרך כלל
      // שמות שדות בקמאל-קייס (walkingTrailId, walkingTrailName...), ולכן אנחנו
      // מתרגמים אותם לשמות הפסקל-קייס שהטמפלייט והקוד מצפים להם.
      map((trails: any[]) =>
        (trails || []).map((t: any) => ({
          WalkingTrailId: t.WalkingTrailId ?? t.walkingTrailId ?? 0,
          WalkingTrailName:
            t.WalkingTrailName ?? t.walkingTrailName ?? '',
          Description: t.Description ?? t.description ?? '',
          regionId: t.regionId ?? t.regionId ?? 0,
          Directions: t.Directions ?? t.directions ?? '',
          LengthInKm: t.LengthInKm ?? t.lengthInKm ?? 0,
          RouteDuration: t.RouteDuration ?? t.routeDuration ?? 0,
          Difficulty: t.Difficulty ?? t.difficulty ?? 0,
          MinAge: t.MinAge ?? t.minAge ?? 0,
          MaxAge: t.MaxAge ?? t.maxAge ?? 0,
          IsWet: t.IsWet ?? t.isWet ?? false,
          SeasonSummer: t.SeasonSummer ?? t.seasonSummer ?? false,
          SeasonWinter: t.SeasonWinter ?? t.seasonWinter ?? false,
          SeasonSpring: t.SeasonSpring ?? t.seasonSpring ?? false,
          SeasonAutumn: t.SeasonAutumn ?? t.seasonAutumn ?? false,
        })),
      ),
    );
  }

  UpdateTrail(route: Int_WalkingTrail): Observable<void> {
    console.log(route);
    return this.http
      .put<void>(`${this.baseUrl}/${route.WalkingTrailId}`, route)
      .pipe(
        catchError((error) => {
          console.error('Error updating walking trail:', error);
          // פה תוכל להראות שגיאה למשתמש או לעשות משהו אחר
          return of(); // מחזיר Observable ריק במקרה של שגיאה
        }),
      );
  }

AddNewTrail(route: Int_WalkingTrail): Observable<any> {
    console.log('Sending new trail data:', route);
    // מחזיר את המסלול החדש שנשמר (כולל ה- WalkingTrailId שנוצר בשרת),
    // כדי שנוכל להעלות אליו תמונות אחרי השמירה.
    return this.http
        .post<any>(`${this.baseUrl}/new`, route)
        .pipe(
            catchError((error) => {
                console.error('Error adding walking trail:', error);
                // מחזיר Observable ריק במקרה של שגיאה
                return of(null as any);
            })
        );
}

  deleteTrail(trailId: number) {
    return this.http
      .delete<void>(`${this.baseUrl}/${trailId}`)
      .pipe(
        catchError((error) => {
          console.error('בעיה במחיקת מסלול הליכה:', error);
          // פה תוכל להראות שגיאה למשתמש או לעשות משהו אחר
          return of(); // מחזיר Observable ריק במקרה של שגיאה
        }),
      );
  }

  // ─────────── תמונות מסלול הליכה ───────────

  /** מחזיר את רשימת התמונות (מטא-דאטה) של מסלול לפי ID. */
  GetImages(hostelId: number): Observable<Int_WalkingTrailFile[]> {
    return this.http
      .get<Int_WalkingTrailFile[]>(`${this.baseUrl}/${hostelId}/images`)
      .pipe(catchError(() => of([])));
  }

  /** מעלה תמונה/ות (File[]) למסלול לפי ID — via multipart/form-data. מחזיר את הרשימה המעודכנת. */
  AddImages(hostelId: number, files: File[]): Observable<Int_WalkingTrailFile[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file, file.name));
    return this.http
      .post<Int_WalkingTrailFile[]>(`${this.baseUrl}/${hostelId}/images`, formData)
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

  formatDuration(minutes: number) {
    if (minutes > 60) {
      if (minutes % 60 === 0) {
        return `${minutes / 60} שעות`;
      } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} שעות ו- ${remainingMinutes} דקות`;
      }
    } else if (minutes === 60) {
      return 'שעה אחת';
    } else {
      return `${minutes} דקות`;
    }
  }

}
