import { Injectable } from '@angular/core';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})

export class UtilsService {

  constructor() { }

  bootstrapClearButton(form) {
    const getPrice = () => form.price.value;

    $('.price :input')
      .on('keydown focus', _.debounce(() => {
        if (!getPrice()) return;
        $('.price :input').nextAll('.form-clear').removeClass('d-none');
      }, 150))
      .on('keydown keyup blur', () => {
        if (getPrice()) return;
        $('.price :input').nextAll('.form-clear').addClass('d-none');
      });

    $('.form-clear').on('click', () => {
      $('.form-clear').addClass('d-none').prevAll(':input').val('');
    });
  }
}
