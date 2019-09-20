import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-annonces',
  templateUrl: './annonces.component.html',
  styleUrls: ['./annonces.component.scss']
})
export class AnnoncesComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute, private fb: FormBuilder) { }

  searchForm: FormGroup;

  ngOnInit() {
    this.searchForm = this.fb.group({
        marque: [null],
        modele: [null],
        energie: [null],
        kilometrage: [null],
        price: [null]
    });

    this.activatedRoute.queryParams.subscribe(params => {
        let marque = params['marque'];
        let modele = params['modele'];
        let price = params['price'];
    });
  }

}
