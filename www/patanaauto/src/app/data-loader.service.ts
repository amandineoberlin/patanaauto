import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})

export class DataLoaderService {

  constructor(private http: HttpClient) {}

  getAnnonces() {
    const marques = [];
    const modeles = [];

    return this.http.get<any[]>('get-annonces')
      .toPromise()
      .then((annonces) => {
        const annoncesSize = _.size(annonces);

        _.forEach(annonces, (vehicule) => {
          modeles.push(vehicule.VehiculeModele.join());
          marques.push(vehicule.VehiculeMarque.join());
        });

        return {
          annonces,
          modeles: _.uniq(modeles),
          marques: _.uniq(marques),
          annoncesSize
        }
      })
  }
}
