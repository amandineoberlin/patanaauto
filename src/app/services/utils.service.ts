import { Injectable } from '@angular/core';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})

export class UtilsService {

  constructor() { }

  bootstrapClearButton(form, filters) {
    _.forEach(filters, (filter) => {
      const getValue = () => form[filter].value;

      $('.custom-input')
        .on('keydown focus', _.debounce(() => {
          if (!getValue()) return;
          $(`.${filter}`).nextAll('.form-clear').removeClass('d-none');
        }, 150))
        .on('keydown keyup blur', () => {
          if (getValue()) return;
          $(`.${filter}`).nextAll('.form-clear').addClass('d-none');
        });

      $(`.${filter}`).siblings('.form-clear').on('click', () => {
        $(`.${filter}`).next().addClass('d-none').prev(':input').val('');
      });
    })
  }
}
