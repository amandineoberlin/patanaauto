import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateAgo',
  pure: true
})

export class DateAgoPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    // parse french format to js US format
    const parseDate = (input) => {
      var parts = input.match(/(\d+)/g);
      return `${parts[1]}-${parts[0]}-${parts[2]}`;
    };

    if (value) {
      console.log(value, parseDate(value));
      const seconds = Math.floor((+new Date() - +new Date(parseDate(value))) / 1000);

      // less than 30 seconds ago will show as 'Just now'
      if (seconds < 29) return 'Just now';

      const intervals = {
        'an': 31536000,
        'mois': 2592000,
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
