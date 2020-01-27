import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { DataLoaderService } from '../services/data-loader.service';

import _ from 'lodash';

@Injectable()
export class AnnonceResolve implements Resolve<any> {

  constructor(private dataLoaderService: DataLoaderService) {}

  // resolves single annonce data and allow route loading only when data is loaded.
  resolve(route: ActivatedRouteSnapshot) {
    return this.dataLoaderService.getSingleAnnonce(_.get(route, 'queryParams.id'));
  }
}
