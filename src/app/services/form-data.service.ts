import { Injectable } from '@angular/core';

import _ from 'lodash';

import { DataLoaderService } from '../services/data-loader.service';
import { Constants } from '../constants';

@Injectable({
  providedIn: 'root'
})

export class FormDataService {

  constructor(private dataService: DataLoaderService) { }

  annonces: Object;

  calculateMax(prop) {
    return _.max(_.map(this.annonces, annonce => parseInt(annonce[prop][0])));
  }

  clearFormData(customForm, val) {
    const form = customForm.controls;
    if (_.isString(val)) return form[val].setValue(null);
    if (_.isArray(val)) return _.forEach(val, v => form[v].setValue(null));
  }

  matchTagValues(annonces, tags) {
    const marques = [];
    const modeles = [];
    const selleries = [];
    const versions = [];
    const vehicules = Constants.VEHICULE_PROPS;

    _.forEach(tags, (tag) => {
      const property = _.keys(tag)[0];
      const tagValue = tag[property];
      if (!tagValue) return;

      _.forEach(annonces, (annonce) => {
        if (annonce[vehicules[property]][0] === tagValue) {
          marques.push(annonce[vehicules['marques']][0]);
          modeles.push(annonce[vehicules['modeles']][0]);
          selleries.push(annonce[vehicules['selleries']][0]);
          versions.push(annonce[vehicules['versions']][0]);
        }
      });
    });

    return {
      marques: _.uniq(marques),
      modeles: _.uniq(modeles),
      selleries: _.uniq(selleries),
      versions: _.uniq(versions)
    };
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
        }

        if (options.quickSearch) return minimiumData;

        const maxAvailableKm = this.calculateMax('VehiculeKilometrage');

        if (options.fullSearch) return _.assign(minimiumData, { maxAvailableKm })
      });
  }
}
