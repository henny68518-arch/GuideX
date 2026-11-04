import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceAllService } from '../Services/service-all.service';

@Pipe({
  name: 'kashrutName',
})
export class KashrutNamePipe implements PipeTransform {
  constructor(private srv_all: ServiceAllService) {}

  transform(kashrutId: number): Observable<string | undefined> {
    // החזרת Observable מטעם הקריאה לשרת; בטמפלייט משתמשים עם pipe מסוג async.
    return this.srv_all.GetKashrutName(Number(kashrutId));
  }
}
