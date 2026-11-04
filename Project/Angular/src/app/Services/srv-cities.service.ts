import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SrvCities {
  private cities_url =
    'https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba';
  constructor(private http: HttpClient) {}

  getData(): Observable<string[]> {
    return this.http.get<any>(this.cities_url).pipe(
      map((response) => {
        if (response?.success && response?.result?.records) {
          return response.result.records.map((record: any) =>
            record['שם_ישוב']?.trim(),
          );
        }
        return [];
      }),
    );
  }

  mock_City: { cityId: number; cityName: string }[] = [
    {
      cityId: 1,
      cityName: 'ירושלים',
    },
    {
      cityId: 2,
      cityName: 'בני ברק',
    },
  ];

  ExistsCity(cityName: string): number {
    return (
      this.mock_City.find((city) => city.cityName === cityName)?.cityId || 0
    );
  }

  getCityById(id : number){
    const cityExists = this.mock_City.find(c => c.cityId == id)?.cityName;
    return cityExists ? cityExists : "שגיאה האבאת העיר";
    
  }
}
