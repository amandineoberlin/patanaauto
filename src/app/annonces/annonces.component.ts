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
  filteredAnnonces: Array<any> = [];
  tri: String;
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

    const updatePrice = (data) => {
      let value;
      if (data.from === data.to) value = `${data.from} €`
      else value = `${data.from} - ${data.to} €`;
      this.searchForm.controls['price']
        .setValue(value, { emitEvent:false })
    }

    const updateKm = (data) => {
      let value;
      if (data.from === data.to) value = `${data.from} km`
      else value = `${data.from} - ${data.to} km`;
      this.searchForm.controls['km']
        .setValue(value, { emitEvent:false })
    }

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
        onChange: updatePrice,
        onUpdate: updatePrice
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
        onChange: updateKm,
        onUpdate: updateKm
    });
  }

  redirectToAnnonce(id) {
    return this.router.navigate(['/annonce'], { queryParams: { id } });
  };

  onFormChanges() {
    this.searchForm
    .valueChanges
    .subscribe((val) => {
      const requestedFilters = _.reduce(val, (acc, v, k) => {
        if (v) return acc.concat(k);
        return acc;
      }, []);

      return this.filterAnnonces(requestedFilters, null, null);
    });
  }

  updateDropdownValuesAfterFilter() {
    return _.forIn(this.filtersMapping, (name, key) => {
      if (_.includes(['price', 'km'], key)) {
        const from = _.min(_.map(this.filteredAnnonces, a => parseInt(a[name][0])));
        const to = _.max(_.map(this.filteredAnnonces, a => parseInt(a[name][0])));
        $(`.js-${key}-slider`).data('ionRangeSlider').update({ from, to });
      }

      this[`${key}s`] = _.uniq(_.flatMap(this.filteredAnnonces, (annonce) => {
        return annonce[name][0];
      }));
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

    const filterValues = {};

    _.forIn(this.filtersMapping, (v, k) => {
      const filterValue = this.searchForm.controls[k] ? this.searchForm.controls[k].value : null;
      if (!filterValue) return;
      _.assignIn(filterValues, { [k]: filterValue });

      this.filteredAnnonces = _.reduce(this.filteredAnnonces, (acc, annonce) => {
        if (annonce[v][0] === filterValue) return acc.concat(annonce);
        return acc;
      }, []);
    });

    this.updateDropdownValuesAfterFilter();
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

    this.activatedRoute.queryParams
      .subscribe((params: any) => {
        this.marqueParam = params['marque'];
        this.modeleParam = params['modele'];
        this.priceParam = params['price'];
      });

    this.formDataService.loadAnnonces({ fullSearch: true })
      .then(dataObj => _.assign(this, dataObj))
      .then(() => this.filterAnnonces([], null, null))
      .then(() => {
        this.initSliders();
        this.utilsService.bootstrapClearButton(this.searchForm.controls);
        // hide price range slider when user clicks anywhere else than the input itself
        this.hideSlidersOnClick();
        this.onFormChanges();
      });
  }

}
