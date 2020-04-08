import { Pipe, PipeTransform } from '@angular/core';
import { UtilsService } from '../services/utils.service';

@Pipe({
  name: 'dateAgo',
  pure: true
})

export class DateAgoPipe implements PipeTransform {

  constructor(
    private utilsService: UtilsService,
  ){}

  transform(value: any): any {
    if (value) {
      const seconds = Math.abs(Date.now() - new Date(this.utilsService.parseDate(value)).getTime()) / 1000;

      // less than 30 seconds ago will show as 'Just now'
      if (seconds < 29) return 'Just now';

      const intervals = {
        'an': 31536000,
        'moi': 2592000,
        'année': 604800,
        'jour': 86400,
        'heure': 3600,
        'minute': 60,
        'seconde': 1
      };

      let counter;
      for (const i in intervals) {
        counter = Math.floor(seconds / intervals[i]);
        if (counter > 0) {
          if (counter === 1) {
            return counter + ' ' + i; // singular (1 day ago)
          } else {
            return counter + ' ' + i + 's'; // plural (2 days ago)
          }
        }
      }
    }

    return value;
  }

}
