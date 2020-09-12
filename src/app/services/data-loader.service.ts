import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})

export class DataLoaderService {

  constructor(private http: HttpClient) {}

  mainImage(annonce) {
    return `/${annonce.images[0]}`;
  }

  getRecentAnnonces() {
    return this.http.get<any[]>('get-latest')
      .toPromise();
  }

  getAnnonces() {
    const marques = [];
    const modeles = [];
    const selleries = [];
    const versions = [];

    return this.http.get<any[]>('get-annonces')
      .toPromise()
      .then((annonces) => {
        const annoncesSize = _.size(annonces);

        const cleanAnnonces = _.map(annonces, (vehicule) => {
          modeles.push(vehicule.VehiculeModele.join());
          marques.push(vehicule.VehiculeMarque.join());
          selleries.push(vehicule.VehiculeSellerie.join());
          versions.push(vehicule.VehiculeVersion.join());

          const images = _.get(vehicule, 'images');
          if (!images) return;

          return _.isEmpty(images) ? null : vehicule;
        });

        return {
          annonces: _.compact(cleanAnnonces),
          modeles: _.uniq(modeles),
          marques: _.uniq(marques),
          selleries: _.uniq(selleries),
          versions: _.uniq(versions),
          annoncesSize
        };
      });
  }

  getSingleAnnonce(id) {
    return this.http.get<any[]>(`get-annonce/${id}`)
      .toPromise();
  }
}
