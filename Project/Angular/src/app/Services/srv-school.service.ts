import { Injectable } from '@angular/core';
import { InterfaceSchool } from '../Interfaces/interface-school';

@Injectable({
  providedIn: 'root'
})
export class SrvSchoolService {

  public mock_Schools: InterfaceSchool[] = [
    {
            SchoolId: 1,
            SchoolName: 'בית יעקב מאירות',
            IsBoys: 0,
            CityId: 1,
            PrincipalName: 'מרכזי רבקה',
            PhoneSecretary: '0500000001',
            TypeSchoolId: 1,
            AgeSchoolId: 1
        },
        {
            SchoolId: 2,
            SchoolName: 'בית יעקב נשמתי',
            IsBoys: 0,
            CityId: 2,
            PrincipalName: 'גב’ חני',
            PhoneSecretary: '0500000002',
            TypeSchoolId: 2,
            AgeSchoolId: 2
        },
        {
            SchoolId: 3,
            SchoolName: 'בית יעקב חן',
            IsBoys: 0,
            CityId: 1,
            PrincipalName: 'גב’ אסתר',
            PhoneSecretary: '0500000003',
            TypeSchoolId: 1,
            AgeSchoolId: 1
        },
        {
            SchoolId: 4,
            SchoolName: 'בית יעקב תפארת',
            IsBoys: 0,
            CityId: 2,
            PrincipalName: 'מר יעקב',
            PhoneSecretary: '0500000004',
            TypeSchoolId: 3,
            AgeSchoolId: 3
        },

  ];
GetSchools(): InterfaceSchool[] {
    return this.mock_Schools;
  }

  GetLastSchoolId(): number {
    const schoolIds = this.mock_Schools.map(school => school.SchoolId);
    return Math.max(...schoolIds);
  }

    ExistsCity(SchoolName: string): number {
    return (
      this.mock_Schools.find((school) => school.SchoolName === SchoolName)?.SchoolId || 0
    );
  }

 


}
