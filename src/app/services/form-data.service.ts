import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import _ from 'lodash';

import { DataLoaderService } from '../services/data-loader.service';
import { Constants } from '../constants';

@Injectable({
  providedIn: 'root'
})

export class FormDataService {

  constructor(
    private dataService: DataLoaderService,
    private http: HttpClient
  ) { }

  annonces: object;

  contactForm(data): Promise<any> {
    return this.http.post<any[]>('send-contact-form', data)
      .toPromise();
  }

  calculateMax(prop) {
    return _.max(_.map(this.annonces, annonce => parseInt(annonce[prop][0], 10)));
  }

  clearFormData(customForm, val) {
    const form = customForm.controls;
    if (_.isString(val)) return form[val].setValue(null);
    if (_.isArray(val)) return _.forEach(val, v => form[v].setValue(null));
  }

  loadRecentAnnonces() {
    return this.dataService.getRecentAnnonces();
  }

  loadAnnonces(options) {
    return this.dataService.getAnnonces()
      .then((dataObj) => {
        this.annonces = dataObj.annonces;
        const data = dataObj;
        const annonces = dataObj.annonces;
        const annoncesSize = dataObj.annoncesSize;
        const marques = _.orderBy(dataObj.marques);
        const modeles = _.orderBy(dataObj.modeles);
        const selleries = _.orderBy(dataObj.selleries);
        const versions = _.orderBy(dataObj.versions);
        const maxAvailablePrice = this.calculateMax('VehiculePrixVenteTTC');
        const minimiumData = {
          data,
          annonces,
          annoncesSize,
          marques,
          modeles,
          selleries,
          versions,
          maxAvailablePrice,
          initFromPrice: Constants.DEFAULT_MIN_PRICE,
          initToPrice: Constants.DEFAULT_MAX_PRICE
        };

        if (options.quickSearch) return minimiumData;

        const maxAvailableKm = this.calculateMax('VehiculeKilometrage');

        if (options.fullSearch) return _.assign(minimiumData, { maxAvailableKm });
      });
  }
}
