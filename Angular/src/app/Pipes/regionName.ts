import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceAllService } from '../Services/service-all.service';

@Pipe({
  name: 'regionName',
})
export class regionNamePipe implements PipeTransform {
  constructor(private srv_all: ServiceAllService) {}

  transform(regionId: number): Observable<string> {
    // החזרת Observable מטעם הקריאה לשרת; בטמפלייט משתמשים עם pipe מסוג async.
    return this.srv_all.GetRegions(Number(regionId));
  }
}
