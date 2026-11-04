import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import {
  Int_Rating,
  Int_RatingAverage,
  Int_RatingList,
  Int_CreateRating,
} from '../Interfaces/int-rating';

@Injectable({
  providedIn: 'root',
})
export class SrvRatingService {
  private baseUrl = 'https://localhost:7098/rating';

  constructor(private http: HttpClient) {}

  /**
   * שליפת כל דירוגי הישות: ממוצע + מספר + רשימה מלאה עם שמות.
   * GET /rating/{entityType}/{entityId}
   */
  GetList(entityType: string, entityId: number): Observable<Int_RatingList> {
    return this.http
      .get<Int_RatingList>(`${this.baseUrl}/${entityType}/${entityId}`)
      .pipe(catchError(() => of({ average: 0, count: 0, ratings: [] })));
  }

  /**
   * שליפת ממוצע ומספר בלבד (בלי הרשימה) — לחישוב קל בעמודות טבלה.
   * GET /rating/{entityType}/{entityId}/average
   */
  GetAverage(entityType: string, entityId: number): Observable<Int_RatingAverage> {
    return this.http
      .get<Int_RatingAverage>(`${this.baseUrl}/${entityType}/${entityId}/average`)
      .pipe(catchError(() => of({ average: 0, count: 0 })));
  }

  /**
   * הוספת דירוג חדש. מותר רק למרכזת פעילה (canRate).
   * POST /rating
   */
  AddRating(payload: Int_CreateRating): Observable<Int_Rating | null> {
    return this.http
      .post<Int_Rating>(this.baseUrl, payload)
      .pipe(catchError(() => of(null)));
  }
}
