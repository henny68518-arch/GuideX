import { Injectable } from '@angular/core';
import { int_Favorite } from '../Interfaces/int_Favorite';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';

export type FavoriteItemType = 'attraction' | 'hostel' | 'trail';

@Injectable({
  providedIn: 'root',
})
export class srv_Favorite {
  private baseUrl = 'https://localhost:7098/Favorite';

  /** רשימת המועדפים של המשתמש הנוכחי — נשמרת מקומית לצורך בדיקות מהירות. */
  private favorites: int_Favorite[] = [];

  constructor(public http: HttpClient) {}

  /** מחזיר (Observable) את כל המועדפים של משתמש — כולל שמות הפריטים מהשרת,
   *  ומאחסן אותם גם מקומית. */
  getFavoritesByUserId(userId: number): Observable<int_Favorite[]> {
    return this.http
      .get<int_Favorite[]>(`${this.baseUrl}/byuser/${userId}`)
      .pipe(
        tap((favorites) => (this.favorites = favorites)),
        catchError((error) => {
          console.error('שגיאה בשליפת המועדפים:', error);
          return of([]);
        }),
      );
  }

  /** האם המשתמש כבר סימן פריט מסוים (לפי הרשימה המקומית שנטענה). */
  isFavorite(userId: number, id: number, type: FavoriteItemType): boolean {
    return this.favorites.some(
      (f) =>
        f.userId === userId &&
        ((type === 'attraction' && f.attractionsId === id) ||
          (type === 'hostel' && f.hostelsId === id) ||
          (type === 'trail' && f.walkingTrailId === id)),
    );
  }

  /**
   * מוסיף מועדף (fire-and-forget — תואם לחתימה הקיימת שנקראת ללא subscribe).
   * שולח לשרת + מוסיף מקומית.
   */
  addFavorite(userId: number, id: number, type: FavoriteItemType) {
    if (this.isFavorite(userId, id, type)) return;

    const payload: any = { userId };
    if (type === 'attraction') payload.attractionsId = id;
    else if (type === 'hostel') payload.hostelsId = id;
    else if (type === 'trail') payload.walkingTrailId = id;

    this.http.post<any>(this.baseUrl, payload).subscribe({
      next: (saved) => {
        // עדכון מקומי עם ה-favoriteId שהשרת החזיר (אם החזיר).
        const newFav: int_Favorite = {
          favoriteId: saved?.favoriteId ?? Date.now(),
          userId,
          ...(type === 'attraction' && { attractionsId: id }),
          ...(type === 'hostel' && { hostelsId: id }),
          ...(type === 'trail' && { walkingTrailId: id }),
        };
        this.favorites.push(newFav);
      },
      error: (err) => console.error('שגיאה בהוספת מועדף:', err),
    });
  }

  /**
   * מסיר מועדף (fire-and-forget — תואם לחתימה הקיימת שנקראת ללא subscribe).
   * מוצא את ה-favoriteId מהרשימה המקומית ושולח DELETE + מסיר מקומית.
   */
  removeFavorite(userId: number, id: number, type: FavoriteItemType) {
    const favorite = this.favorites.find(
      (f) =>
        f.userId === userId &&
        ((type === 'attraction' && f.attractionsId === id) ||
          (type === 'hostel' && f.hostelsId === id) ||
          (type === 'trail' && f.walkingTrailId === id)),
    );

    if (!favorite) return;

    this.favorites = this.favorites.filter(
      (f) => f.favoriteId !== favorite.favoriteId,
    );

    this.http.delete<void>(`${this.baseUrl}/${favorite.favoriteId}`).subscribe({
      error: (err) => console.error('שגיאה במחיקת מועדף:', err),
    });
  }

  /** מסיר מועדף לפי ה-favoriteId (משמש את עמוד המועדפים) — fire-and-forget. */
  removeByFavoriteId(favoriteId: number) {
    this.favorites = this.favorites.filter((f) => f.favoriteId !== favoriteId);
    this.http.delete<void>(`${this.baseUrl}/${favoriteId}`).subscribe({
      error: (err) => console.error('שגיאה במחיקת מועדף:', err),
    });
  }

}
