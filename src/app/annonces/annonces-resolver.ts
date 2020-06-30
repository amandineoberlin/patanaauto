import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { FormDataService } from '../services/form-data.service';

import _ from 'lodash';

@Injectable()
export class AnnoncesResolver implements Resolve<any> {

  constructor(
    private formDataService: FormDataService,
  ) {}

  // loads annonces data without blocking page load
  resolve() {
    return this.formDataService.loadAnnonces({ fullSearch: true });
  }
}
