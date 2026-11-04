import { Injectable } from '@angular/core';
import { int_Attractions, int_AttractionFile } from '../Interfaces/int_Attractions';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class srv_Attractions {
  constructor(public http: HttpClient) {}
  
  GetAttractions() {
    const baseUrl = 'https://localhost:7098/Attractions';
    return this.http.get<int_Attractions[]>(baseUrl);
  }

 

  getAttractionTypes() {
    const baseUrl = 'https://localhost:7098/Attractions/types';
    return this.http.get<any>(baseUrl).pipe(
      tap((data: any) => console.log('Attraction types aaa:', data)), // לוג של המידע המוחזר
    );
  }



  UpdateAttraction(attraction: int_Attractions): Observable<void> {
    console.log(attraction);
    return this.http
      .put<void>(
        `https://localhost:7098/Attractions/${attraction.attractionId}`,
        attraction,
      )
      .pipe(
        catchError((error) => {
          console.error('Error updating attraction:', error);
          // פה תוכל להראות שגיאה למשתמש או לעשות משהו אחר
          return of(); // מחזיר Observable ריק במקרה של שגיאה
        }),
      );

      
  }
  //   AddNewAttraction(attraction: int_Attractions): Observable<void> {
  //   console.log(attraction);
  //   return this.http
  //     .post<void>(
  //       `https://localhost:7098/Attractions/new`,
  //       attraction,
  //     )
  //     .pipe(
  //       catchError((error) => {
  //         console.error('Error updating attraction:', error);
  //         // פה תוכל להראות שגיאה למשתמש או לעשות משהו אחר
  //         return of(); // מחזיר Observable ריק במקרה של שגיאה
  //       }),
  //     );
  // }

AddNewAttraction(attraction: int_Attractions): Observable<any> {
    console.log(attraction);
    // מחזיר את האטרקציה החדשה שנשמרה (כולל ה- attractionId שנוצר בשרת),
    // כדי שנוכל להעלות אליה תמונות אחרי השמירה.
    return this.http
      .post<any>(`https://localhost:7098/Attractions/new`, attraction)
      .pipe(
        catchError((error) => {
          console.error('Error updating attraction:', error);
          // מכאן תוכל להראות שגיאה למשתמש או לעשות משהו אחר
          return throwError(() => new Error('לא הצלחנו להוסיף אטרקציה: ' + error.message));
        }),
      );
}

  // ─────────── תמונות אטרקציה ───────────

  /** מחזיר את רשימת התמונות (מטא-דאטה) של אטרקציה לפי ID. */
  GetImages(attractionId: number): Observable<int_AttractionFile[]> {
    return this.http
      .get<int_AttractionFile[]>(`https://localhost:7098/Attractions/${attractionId}/images`)
      .pipe(catchError(() => of([])));
  }

  /** מעלה תמונה/ות (File[]) לאטרקציה לפי ID — via multipart/form-data. מחזיר את הרשימה המעודכנת. */
  AddImages(attractionId: number, files: File[]): Observable<int_AttractionFile[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file, file.name));
    return this.http
      .post<int_AttractionFile[]>(`https://localhost:7098/Attractions/${attractionId}/images`, formData)
      .pipe(catchError(() => of([])));
  }

  /** מוחק תמונה לפי FileId. */
  DeleteImage(fileId: number): Observable<void> {
    return this.http
      .delete<void>(`https://localhost:7098/Attractions/file/${fileId}`)
      .pipe(catchError(() => of()));
  }

  /** כתובת URL לשליפת תוכן התמונה (לקריאת ה- src של <img>). */
  ImageUrl(fileId: number): string {
    return `https://localhost:7098/Attractions/file/${fileId}`;
  }
  deleteAttraction(atractionId : number){
        return this.http
      .delete<void>(
        `https://localhost:7098/Attractions/${atractionId}`,
        
      )
      .pipe(
        catchError((error) => {
          console.error('בעיה במחיקת אטרקציה:', error);
          // פה תוכל להראות שגיאה למשתמש או לעשות משהו אחר
          return of(); // מחזיר Observable ריק במקרה של שגיאה
        }),
      );
  }

  //   UpdateAttraction(attraction: int_Attractions): Observable<void> {
  //     console.log(attraction)
  //    return this.http.put<void>(`https://localhost:7098/Attractions/${attraction.attractionId}`, attraction);
  // }

}
