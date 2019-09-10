import { Component, OnInit } from '@angular/core';
import _ from 'lodash';
import * as $ from 'jquery';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  annonces: Object;
  annoncesSize: Number;

  constructor(private http: HttpClient) { }

  public getAnnonces() {
    return this.http.get('get-annonces')
      .toPromise()
      .then((annonces) => {
        this.annonces = annonces;
        this.annoncesSize = _.size(annonces);
      })
  }

  ngOnInit() {
    (<any>$('.carousel')).carousel();
    this.getAnnonces();
  }

}
