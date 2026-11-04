import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'greeting',
  pure: false // מאפשר עדכון כנגד שינויים
})
export class GreetingPipe implements PipeTransform {

  transform(a:string): string {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
      return 'בוקר טוב!';
    } else if (hour >= 12 && hour < 17) {
      return 'צהרים טובים!';
    } else if (hour >= 17 && hour < 21) {
      return 'ערב טוב!';
    } else {
      return 'לילה טוב!';
    }
  }
}