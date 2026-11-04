import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Pipe({
  name: 'attractionTypeName',
})
export class AttractionTypeNamePipe implements PipeTransform {

  constructor(private http: HttpClient) {}

  transform(attractionsTypeId: number): Observable<string> {
      const url = `https://localhost:7098/Attractions/${attractionsTypeId}`;
      return this.http.get<string>(url).pipe(
        map(response => {
          return response;
        }),
        catchError(() => {
          console.log('Error fetching attraction type for ID:', attractionsTypeId); // לוג במקרה של שגיאה
          return of('האטרקציה לא נמצאה'); // החזרת ברירת מחדל במקרה של שגיאה
        })
      );
  }
}