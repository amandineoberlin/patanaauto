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
  annonces: Object;
  annoncesSize: Number;
  maxAvailablePrice: number;
  maxAvailableKm: number;
  marques: Array<any>;
  modeles: Array<any>;
  versions: Array<any>;
  selleries: Array<any>;
  blockPriceSlider: Boolean = false;
  blockKmSlider: Boolean = false;
  blockVersions: Boolean = false;
  showPriceRange: Boolean = false;
  showKmRange: Boolean = false;
  initFromPrice: Number;
  initToPrice: Number;
  notFoundText: String = Constants.NOT_FOUND_MESSAGE;
  limit: Number = 10;
  filteredAnnonces: Array<any> = [];
  tri: String;
  priceFrom: Number = 1000;
  priceTo: Number = 25000;
  kmFrom: Number = 0;
  kmTo: Number = 230000;

  filtersMapping: Object = {
    km: 'VehiculeKilometrage',
    price: 'VehiculePrixVenteTTC',
    marque: 'VehiculeMarque',
    modele: 'VehiculeModele',
    version: 'VehiculeVersion',
    sellerie: 'VehiculeSellerie',
    date: 'VehiculeCarteGriseDate'
  }

  mainImage(annonce) {
    return this.dataLoaderService.mainImage(annonce);
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

  displayFormValue(formProps, data) {
    if (_.isString(formProps)) this.searchForm.controls[formProps].setValue(data);
    if (_.isArray(formProps)) {
      _.forEach(formProps, prop => {
        if (_.size(data[prop]) === 1) this.searchForm.controls[prop].setValue(data[prop][0]);
      })
    }
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

  initSliders() {
    const roundMaxPrice = _.ceil(this.maxAvailablePrice) > 30000 ? _.ceil(this.maxAvailablePrice) : 30000;

    const updatePrice = (data, emitEvent) => {
      let value;
      if (data.from === data.to) return data.to = data.from + 10;
      value = `${data.from} - ${data.to} €`;
      return this.searchForm.controls['price']
        .setValue(value, { emitEvent });
    }

    const updateKm = (data, emitEvent) => {
      let value;
      if (data.from === data.to) return data.to = data.from + 10;
      value = `${data.from} - ${data.to} km`;
      return this.searchForm.controls['km']
        .setValue(value, { emitEvent })
    }

    //@ts-ignore
    $('.js-price-slider').ionRangeSlider({
        type: 'double',
        min: 0,
        max: roundMaxPrice,
        from: this.priceFrom,
        to: this.priceTo,
        grid: true,
        prefix: '€ ',
        step: 50,
        onChange: (data) => updatePrice(data, true),
        onUpdate: (data) => updatePrice(data, false)
    });

    const roundMaxKm = _.ceil(this.maxAvailableKm) > 250000 ? _.ceil(this.maxAvailableKm) : 250000;
    //@ts-ignore
    $('.js-km-slider').ionRangeSlider({
        type: 'double',
        min: 0,
        max: roundMaxKm,
        from: this.kmFrom,
        to: this.kmTo,
        grid: true,
        prefix: 'km: ',
        step: 50,
        onChange: (data) => updateKm(data, true),
        onUpdate: (data) => updateKm(data, false)
    });
  }

  resetFilters(filter) {
    if (_.isEmpty(this.filteredAnnonces) || !filter) {
      const { modeles, marques, selleries, versions } = this.data;

      this.modeles = _.clone(modeles);
      this.marques = _.clone(marques);
      this.selleries = _.clone(selleries);
      this.versions = _.clone(versions);

      this.searchForm.reset();
    }
  }

  isInRange(val, start, end) {
    return val >= start && val <= end;
  }

  splitRange(value, key) {
    const symbol = key === 'price' ? '€' : 'km';
    const range = _.split(value, '-');
    const firstRange = parseInt(range[0]);
    const secondRange = parseInt(range[1].split(symbol));

    return { firstRange, secondRange };
  }

  isSliderInRange(filterValue, v, k) {
    const { firstRange, secondRange } = this.splitRange(v, k);
    const isWithinRange = this.isInRange(parseInt(filterValue), firstRange, secondRange);
    return isWithinRange;
  }

  redirectToAnnonce(id) {
    return this.router.navigate(['/annonce'], { queryParams: { id } });
  };

  onFormChanges() {
    this.searchForm
      .valueChanges
      .subscribe((val) => {
        const requestedFilters = _.reduce(val, (acc, v, k) => (v ? acc.concat(k) : acc), []);
        return this.filterAnnonces(requestedFilters, null, null);
      });
  }

  updateDropdownValuesAfterFilter() {
    return _.forIn(this.filtersMapping, (name, key) => {
      if (_.includes(['price', 'km'], key)) return;
      this[`${key}s`] = _.uniq(_.flatMap(this.filteredAnnonces, (annonce) => annonce[name][0]));
    });
  }

  addFiltersUp(annonce) {
    return _.map(this.filtersMapping, (v, k) => {
      const filterValue = this.searchForm.controls[k] ? this.searchForm.controls[k].value : null;
      if (!filterValue) return;

      const annonceVal = annonce[v][0];

      if (_.includes(['price', 'km'], k)) return !this.isSliderInRange(annonceVal, filterValue, k)

      return annonceVal !== filterValue;
    });
  }

  filterAnnonces(filters = [], order = null, isTri) {
    if (!filters || _.isEmpty(filters)) {
      return this.filteredAnnonces = _.clone(this.annonces);
    }

    if (isTri) {
      const singleFilter = filters[0];
      if (_.size(this.filteredAnnonces) < 2) return;

      const orderBy = _.map(this.filteredAnnonces, (a) => {
        let item = a[this.filtersMapping[singleFilter]][0];
        if (_.includes(['price', 'km'], singleFilter)) item = parseInt(item);
        if (singleFilter === 'date') {
          const date = item.split('-');
          item = new Date(date[2], date[1], date[0]);
        }
        return { _id: a._id, item };
      });

      const orderedItems = _.orderBy(orderBy, ['item'], [order]);

      this.filteredAnnonces = _.map(orderedItems, a => _.find(this.filteredAnnonces, { _id: a._id }));

      return this.tri = order ? `${singleFilter === 'price' ? 'prix' : singleFilter} ${order}` : singleFilter;
    }

    this.filteredAnnonces = _.reduce(this.annonces, (acc, annonce) => {
      const areSomeInvalidAnnonces = _.compact(this.addFiltersUp(annonce));
      return _.isEmpty(areSomeInvalidAnnonces) ? acc.concat(annonce) : acc;
    }, []);

    this.updateDropdownValuesAfterFilter();
  }

  onRouteChange() {
    this.activatedRoute.queryParams
      .subscribe((params: any) => {
        if (_.isEmpty(params)) return;
        _.forIn(params, (v, k) => {
          this.searchForm.controls[k].setValue(v);
        });
        this.filterAnnonces(_.keys(params), null, false)
      });
  }

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

    this.formDataService.loadAnnonces({ fullSearch: true })
      .then(dataObj => _.assign(this, dataObj))
      .then(() => (this.filteredAnnonces = _.clone(this.annonces)))
      .then(() => {
        this.initSliders();
        this.utilsService.bootstrapClearButton(this.searchForm.controls);
        this.hideSlidersOnClick();
        this.onFormChanges();
        this.onRouteChange();
      });
  }

}
