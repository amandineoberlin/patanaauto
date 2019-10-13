import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import _ from 'lodash';

@Component({
  selector: 'app-annonce',
  templateUrl: './annonce.component.html',
  styleUrls: ['./annonce.component.scss']
})
export class AnnonceComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute
  ) { }

  annonceId: Number;
  state: Observable<object>;

  ngOnInit() {
    this.state = this.activatedRoute.paramMap.pipe(
      map(() => window.history.state)
    );

    console.log(this.state);
  }

}
