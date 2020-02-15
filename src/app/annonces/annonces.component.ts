import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

import _ from 'lodash';

import { FormDataService } from '../services/form-data.service';
import { DataLoaderService } from '../services/data-loader.service';
import { UtilsService } from '../services/utils.service';
import { Constants } from '../constants';

@Component({
  selector: 'app-annonces',
  templateUrl: './annonces.component.html',
  styleUrls: ['./annonces.component.scss']
})
export class AnnoncesComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private formDataService: FormDataService,
    private dataLoaderService: DataLoaderService,
    private utilsService: UtilsService,
    private router: Router
  ) { }

  searchForm: FormGroup;
  data: { [name: string]: Object };
  marqueParam: String;
  modeleParam: String;
  priceParam: String;
  annonces: Object;
  annoncesSize: Number;
  maxAvailablePrice: number;
  maxAvailableKm: number;
  marques: Array<string>;
  modeles: Array<string>;
  versions: Array<string>;
  selleries: Array<string>;
  blockPriceSlider: Boolean = false;
  blockKmSlider: Boolean = false;
  blockVersions: Boolean = false;
  showPriceRange: Boolean = false;
  showKmRange: Boolean = false;
  initFromPrice: Number;
  initToPrice: Number;
  notFoundText: String = Constants.NOT_FOUND_MESSAGE;
  limit: Number = 10;
  filteredAnnonces: Object = [];

  mainImage(annonce) {
    return this.dataLoaderService.mainImage(annonce);
  }

  filterAnnonces(filter) {
    if (!filter) this.filteredAnnonces = _.slice(this.annonces, 0, this.limit);
  }

  inputValue(el) {
    return el.data();
  }

  choosePriceClass() {
    if (this.blockPriceSlider) return 'hide';
    return this.showPriceRange ? 'show' : 'hide';
  }

  chooseKmClass() {
    if (this.blockKmSlider) return 'hide';
    return this.showKmRange ? 'show' : 'hide';
  }

  togglePriceView() {
    if (this.blockPriceSlider) return;

    const priceEl = $('.js-price-slider');

    this.showPriceRange = !this.showPriceRange;
    if (this.showPriceRange) this.showKmRange = false;

    const price = this.inputValue(priceEl);
    if (_.isEmpty(price)) return;

    this.searchForm.controls['price'].setValue(`${priceEl.data('from')} - ${priceEl.data('to')} €`);
  }

  toggleKmView() {
    if (this.blockKmSlider) return;

    const kMEl = $('.js-km-slider');

    this.showKmRange = !this.showKmRange;
    if (this.showKmRange) this.showPriceRange = false;

    const km = this.inputValue(kMEl);
    if (_.isEmpty(km)) return;

    this.searchForm.controls['km'].setValue(`${kMEl.data('from')} - ${kMEl.data('to')} km`);
  }

  displayFormVal(formProps, data) {
    if (_.isString(formProps)) this.searchForm.controls[formProps].setValue(data);
    if (_.isArray(formProps)) {
      _.forEach(formProps, prop => {
        if (_.size(data[prop]) === 1) this.searchForm.controls[prop].setValue(data[prop][0]);
      })
    }
  }

  clearData(data) {
    this.formDataService.clearFormData(this.searchForm, data);
  }

  resetValues(values) {
    _.forEach(values, v => this[v] === _.orderBy(this.data[v]));
  }

  clear(value) {
    switch (value) {
      case 'marque':
        this.clearData(['modele', 'version', 'sellerie']);
        this.resetValues(['marques', 'modeles', 'versions', 'selleries'])
        break;
      case 'modele':
        this.clearData(['version', 'sellerie']);
        this.resetValues(['modeles', 'versions', 'selleries'])
        break;
      case 'version':
        this.clearData(['sellerie']);
        this.resetValues(['versions', 'selleries'])
        break;
      case 'sellerie':
        this.clearData(['version']);
        this.resetValues(['selleries'])
        break;
    }
  }

  update(value) {
    const form = this.searchForm.controls;
    const formValues = _.compact(_.map(form, f => f.value));

    if (_.isEmpty(formValues)) this.resetValues(['modeles', 'marques', 'versions', 'selleries']);
    this.clear(value);

    const {
      marques,
      modeles,
      versions,
      selleries
    } = this.formDataService.matchTagValues(this.annonces, [
      { marques: form['marque'].value },
      { modeles: form['modele'].value },
      { selleries: form['sellerie'].value },
      { versions: form['version'].value }
    ]);

    this.marques = marques;
    this.modeles = modeles;
    this.versions = versions;
    this.selleries = selleries;

    this.displayFormVal(['marque', 'modele', 'version', 'sellerie'],
      { marque: marques, modele: modeles, version: versions, sellerie: selleries });
  }

  hideSlidersOnClick() {
    $('html').click((e) => {
      //@ts-ignore
      if (!this.showPriceRange && !this.showKmRange) return;

      const isInsideSlider = e.target.className.indexOf('irs') > -1;
      const isInsideInput = e.target.className.indexOf('custom-input') > -1;
      const hasSliderParent = $(e.target).parent()[0].className.indexOf('irs') > -1;

      if (!isInsideInput && !isInsideSlider && !hasSliderParent) {
        this.showPriceRange = false;
        this.showKmRange = false;
      }
    });
  }

  navigateToAnnonce(id, state) {
    this.router.navigateByUrl(`annonce/${id}`, { state });
  }

  initSliders() {
    const roundMaxPrice = _.ceil(this.maxAvailablePrice) > 30000 ? _.ceil(this.maxAvailablePrice) : 30000;
    //@ts-ignore
    $('.js-price-slider').ionRangeSlider({
        type: 'double',
        min: 0,
        max: roundMaxPrice,
        from: 1000,
        to: 5000,
        grid: true,
        prefix: '€ ',
        step: 50,
        onChange: (data) => {
          const from = data.from;
          const to = data.to;
          this.searchForm.controls['price'].setValue(`${from} - ${to} €`);
        }
    });

    const roundMaxKm = _.ceil(this.maxAvailableKm) > 250000 ? _.ceil(this.maxAvailableKm) : 250000;
    //@ts-ignore
    $('.js-km-slider').ionRangeSlider({
        type: 'double',
        min: 0,
        max: roundMaxKm,
        from: 0,
        to: 80000,
        grid: true,
        prefix: 'km: ',
        step: 50,
        onChange: (data) => {
          const from = data.from;
          const to = data.to;
          this.searchForm.controls['km'].setValue(`${from} - ${to} km`);
        }
    });
  }

  redirectToAnnonce(id) {
    return this.router.navigate(['/annonce'], { queryParams: { id } });
  };

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      marque: [null],
      modele: [null],
      version: [null],
      sellerie: [null],
      price: [null],
      km: [null]
    });

    //@ts-ignore
    $('.dropdown-toggle').dropdown()

    this.activatedRoute.queryParams
      .subscribe((params: any) => {
        this.marqueParam = params['marque'];
        this.modeleParam = params['modele'];
        this.priceParam = params['price'];
      });

    this.formDataService.loadAnnonces({ fullSearch: true })
      .then(dataObj => _.assign(this, dataObj))
      .then(() => this.filterAnnonces(null))
      .then(() => {
        this.initSliders();
        this.utilsService.bootstrapClearButton(this.searchForm.controls);
        // hide price range slider when user clicks anywhere else than the input itself
        this.hideSlidersOnClick();
      });
  }

}
