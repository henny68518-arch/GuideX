import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CoordinatorRegisterPayload,
  InterfaceCoordinator,
} from '../Interfaces/int-coordinator';

@Injectable({
  providedIn: 'root',
})
export class ServiceCoordinatorService {
  // הנתיב תואם ל-[Route("/all_[controller]")] בקונטרולר Coordinator בשרת.
  private readonly registerUrl = 'https://localhost:7098/coordinator/register';

  constructor(private http: HttpClient) {}
  mock_Coordinators: InterfaceCoordinator[] = [
    {
      UserId: 1,
      TourCoordinatorId: 1,
      RoleId: 3,
      SchoolId: 1,
    },
    {
      UserId: 2,
      TourCoordinatorId: 2,
      RoleId: 4,
      SchoolId: 2,
    },
    {
      UserId: 3,
      TourCoordinatorId: 3,
      RoleId: 5,
      SchoolId: 3,
    },
    {
      UserId: 4,
      TourCoordinatorId: 4,
      RoleId: 2,
      SchoolId: 4,
    },
    {
      UserId: 10,
      TourCoordinatorId: 5,
      RoleId:5,
      SchoolId: 4,
    }
  ];

  GetLastTourCoordinatorId() {
    const coordinatorIds = this.mock_Coordinators.map(
      (coordinator) => coordinator.TourCoordinatorId,
    );
    return Math.max(...coordinatorIds);
  }


  /**
   * שולח את כל פרטי רישום הכורדינטור (משתמש + תפקיד + מוסד-אם-חדש)
   * ל-POST /all_coordinator/register ומפיק את ה-{ userId } שמוחזר מהשרת.
   * ה-Identity של השרת מייצר את המזהים לבד.
   */
  registerCoordinator(payload: CoordinatorRegisterPayload): Observable<any> {
    return this.http.post<any>(this.registerUrl, payload).pipe(
      catchError((err) => {
        console.error('שגיאה ברישום הכורדינטור:', err);
        console.error('סטטוס:', err.status);
        console.error('גוף התשובה:', err.error);
        return of(null);
      }),
    );
  }
}
