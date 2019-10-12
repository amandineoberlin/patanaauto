import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})

export class DataLoaderService {

  constructor(private http: HttpClient) {}

  getAnnoncesPhotos(annonces) {
    return this.http.get<any[]>('get-photos')
      .toPromise()
      .then((photos) => {
        const match = _.reduce(photos, (acc, k) => {
          const vehiculeEntity = _.get(k, '_id').split('_')[0];
          const name = _.get(k, 'name');
          acc[vehiculeEntity] ? acc[vehiculeEntity].push(name) : acc[vehiculeEntity] = [name];
          return acc;
        }, {});

        _.forEach(_.values(match), (key, index) => {
          annonces[index].images = key;
        }, []);
        
        return annonces;
      })
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

        _.forEach(annonces, (vehicule) => {
          modeles.push(vehicule.VehiculeModele.join());
          marques.push(vehicule.VehiculeMarque.join());
          selleries.push(vehicule.VehiculeSellerie.join());
          versions.push(vehicule.VehiculeVersion.join());
        });

        return {
          annonces,
          modeles: _.uniq(modeles),
          marques: _.uniq(marques),
          selleries: _.uniq(selleries),
          versions: _.uniq(versions),
          annoncesSize
        }
      })
  }
}
