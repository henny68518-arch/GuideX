import { Injectable } from '@angular/core';
import { InterfaceUsers } from '../Interfaces/interface-users';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceUsersService {
  public mock_Users: InterfaceUsers[];

  //   constructor(public serviceCoordinator: ServiceCoordinatorService, public serviceGuide: ServiceUsersService) {
  constructor(
    public  http: HttpClient
  ) {
    this.mock_Users = [
      {
        UserId: 1,
        UserPassword: 'securePassword123!',
        FirstName: 'חיה',
        LastName: 'מאירוביץ',
        IdNumber: '123456789',
        CityId: 101,
        PhoneNumber: '0501234567',
        Email: 'haya.meir@gmail.com',
      },
  ]

  }

  /** שולף את כל המשתמשים באתר מהשרת (GET /Users). */
  GetAllUsers(): Observable<any[]> {
    return this.http.get<any[]>('https://localhost:7098/Users').pipe(
      catchError((error) => {
        console.error('שגיאה בשליפת המשתמשים:', error);
        return of([] as any[]);
      }),
    );
  }

  /**
   * הופך (toggles) הרשאת משתמש אחת בשרת (PUT /Users/{userId}/permission).
   * השרת קורא את הערך הנוכחי, הופך אותו ושומר — אין צורך לשלוח את הערך עצמו.
   * @param userId מזהה המשתמש.
   * @param permission שם ההרשאה (למשל 'superAdmin', 'editRoutes'...).
   */
  UpdatePermission(
    userId: number,
    permission: string,
  ): Observable<any> {
    const baseUrl = `https://localhost:7098/Users/${userId}/permission`;
    const body = { permission };
    return this.http.put<any>(baseUrl, body).pipe(
      catchError((error) => {
        console.error(`שגיאה בעדכון ההרשאה ${permission} למשתמש ${userId}:`, error);
        return of(null);
      }),
    );
  }

  
  
  GetLastUserId() {
    const userIds = this.mock_Users.map((user) => user.UserId);
    return Math.max(...userIds);
  }



  // getEmailByUserId(userId: number): string {
  //   // const user = this.mock_Users.find((u) => u.UserId === userId);
  //   // return user ? user.Email : '';
    

  //   const urlToGetEmail = 'https://localhost:7098/Users/user_${userId}'
  //   return this.http.get(urlToGetEmail).subscribe(
  //     (response: any) => {
  //       // Assuming the response contains the email in a property called 'email'
  //     }
  //   );
  // }
// getEmailByUserId(userId: number): Observable<string> {
//   const urlToGetEmail = `https://localhost:7098/Users/email_${userId}`;
//   return this.http.get<string>(urlToGetEmail).pipe(
//     catchError(error => {
//       console.error("שגיאה בהבאת המייל:", error);
//       return throwError(error);
//     })
//   );
// }

  /** מחזיר (Observable) את המדריך שנמצא לפי מספר זהות — דרך השרת.
   *  מחפש את ה-UserId לפי ה-IdNumber ב-mock המשתמשים, ואז שולף את המדריך מהשרת. */

getUserByEmailIdNumberPhone(EmPhId: JSON) {
    const baseUrl = 'https://localhost:7098/api/Login/resetFirst';
    return this.http.post<any>(baseUrl, EmPhId).pipe(
        tap(response => {
            console.log('User found:', response);
            if (!response) {
                console.log("לא מצאתי משתמש");
            }
        }),
        catchError(error => {
            console.log("לא הצלחתי לבצע קריאת שרת");
            // console.error('Error:', error);
            return of(null); // מחזיר Observable עם ערך null במקרה של שגיאה
        })
    );
  }

  /** שולף את פרופיל המשתמש (מדריכה/רכזת) מהשרת לפי UserId — לצורך טופס העריכה. */
  getProfile(userId: number | string): Observable<any> {
    console.log('getProfile called with userId:', userId);
    const baseUrl = `https://localhost:7098/profile/${userId}`;
    const  zzz =  this.http.get<any>(baseUrl).pipe(
      catchError((error) => {
        console.error('שגיאה בשליפת הפרופיל:', error);
        return of(null);
      }),
    );
    console.log('getProfile response:', zzz);
    return zzz;
  }

  /** מעדכן פרופיל של רכזת/מוסד (PUT /coordinator/update). */
  updateCoordinator(payload: any): Observable<any> {
    const baseUrl = 'https://localhost:7098/coordinator/update';
    return this.http.put<any>(baseUrl, payload).pipe(
      catchError((error) => {
        console.error('שגיאה בעדכון הכורדינטור:', error);
        return of(null);
      }),
    );
  }

  /** מעדכן פרטים בסיסיים של משתמש רגיל (למשל מנהל) — PUT /Users/{userId}.
   *  ת.ז. וסיסמה אינן ניתנות לעריכה ואינן נשלחות. */
  updateUser(userId: number | string, payload: any): Observable<any> {
    const baseUrl = `https://localhost:7098/Users/${userId}`;
    return this.http.put<any>(baseUrl, payload).pipe(
      catchError((error) => {
        console.error('שגיאה בעדכון המשתמש:', error);
        return of(null);
      }),
    );
  }
}
