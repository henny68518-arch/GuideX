import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceAllService {
  constructor(public http: HttpClient) {}

getReligiousName(religiousId: number): Observable<string | undefined> {
    return this.http.get<string>(`https://localhost:7098/Religious_${religiousId}`)
        .pipe(map(response => response ? response : 'אחר'));
}

  getAgeSchoolName(ageSchoolId: number): string | undefined {
    switch (ageSchoolId) {
      case 1:
        return 'יסודי';
      case 2:
        return 'חט"ב';
      case 3:
        return 'תיכון';
      default:
        return 'אחר';
    }
  }
  GetRegions(regionId: number): Observable<string> {
    return this.http.get<string>(`https://localhost:7098/region_${regionId}`)
        .pipe(map(response => response ? response : 'אחר'));
  }


  getRegionsArray() {
    const baseUrl = 'https://localhost:7098/All_Regions';


     return this.http.get<any>(baseUrl).pipe(
    );

    
  }

GetKashrutName(kashrutId: number): Observable<string | undefined> {
  console.log("kashrutId: ", kashrutId)
    return this.http.get<string>(`https://localhost:7098/Kashrut_${kashrutId}`)
    
        .pipe(map(response => response ? response : 'אחר'));
}

 

  getKashrutArray() {
    const baseUrl = 'https://localhost:7098/All_Kashruts';
    return this.http.get<any>(baseUrl).pipe(
      tap((data: any) => console.log('סוגי הכשרויות:', data)), // לוג של המידע המוחזר
    );

}
  getreligiousArray() {
    const baseUrl = 'https://localhost:7098/All_Religious';
    return this.http.get<any>(baseUrl).pipe(
      tap((data: any) => console.log('סוגי ההשתיכות הדתית:', data)), // לוג של המידע המוחזר
    );
}

getRolesArray() {
    const baseUrl = 'https://localhost:7098/All_Roles';
    return this.http.get<any>(baseUrl).pipe(
      tap((data: any) => console.log('סוגי התפקידים:', data)), // לוג של המידע המוחזר
    );
}

}
