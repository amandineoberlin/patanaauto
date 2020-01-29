import { Component, OnInit, ɵConsole } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Chart from 'chart.js';

//import { Observable } from 'rxjs';

import _ from 'lodash';

import { DataLoaderService } from '../services/data-loader.service';

@Component({
  selector: 'app-annonce',
  templateUrl: './annonce.component.html',
  styleUrls: ['./annonce.component.scss']
})
export class AnnonceComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataLoaderService: DataLoaderService,
  ) { }

  annonceId: Number;
  annonce: Object;
  options: Array<string>;
  //state: Observable<object>;

  mainImage(annonce) {
    return this.dataLoaderService.mainImage(annonce);
  }

  getOptions() {
    const options = this.annonce['VehiculeEquipementsOptionArgus'][0].split('|');
    const equip = this.annonce['VehiculeEquipementsSerieArgus'][0].split('|');

    return _.concat(options, equip);
  }

  createConsoChart() {
    const consoMixte = this.annonce['VehiculeConsommationMixte'][0];
    const consoUrbaine = this.annonce['VehiculeConsommationMixte'][0];
    const consoExtraUrbaine = this.annonce['VehiculeConsommationMixte'][0];

    const ctx = document.getElementById('consoChart');
    new Chart(ctx, {
      type: 'horizontalBar',
      options: {
        maintainAspectRatio: true,
        responsive: true,
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
            display: true,
            ticks: {
              suggestedMin: 3,
              max: 12
            }
          }]
        }
      },
      data: {
        labels: ['Mixte', 'Urbaine', 'Extra-urbaine'],
        barPercentage: 3,
        datasets: [{
          barThickness: 30,
          data: [parseInt(consoMixte), parseInt(consoUrbaine), parseInt(consoExtraUrbaine)],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1
        }]
      },
    });
  }

  createFiscaleChart() {
    const powerFisc = this.annonce['VehiculePuissanceFiscale'][0];

    const ctx = document.getElementById('fiscaleChart');
    new Chart(ctx, {
      type: 'horizontalBar',
      options: {
        maintainAspectRatio: true,
        responsive: true,
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
            display: true,
            ticks: {
              suggestedMin: 0,
              max: 30
            }
          }]
        }
      },
      data: {
        labels: ['Fiscale'],
        barPercentage: 1,
        datasets: [{
          barThickness: 30,
          data: [parseInt(powerFisc)],
          backgroundColor: ['rgba(75, 192, 192, 0.2)'],
          borderColor: ['rgba(75, 192, 192, 1)'],
          borderWidth: 1
        }]
      },
    });
  }

  createReelleChart() {
    const powerReal = this.annonce['VehiculePuissanceReelle'][0];

    const ctx = document.getElementById('reelleChart');
    new Chart(ctx, {
      type: 'horizontalBar',
      options: {
        maintainAspectRatio: true,
        responsive: true,
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
            display: true,
            ticks: {
              suggestedMin: 0,
              max: 200
            }
          }]
        }
      },
      data: {
        labels: ['Réelle'],
        barPercentage: 1,
        datasets: [{
          barThickness: 30,
          data: [parseInt(powerReal)],
          backgroundColor: ['rgba(153, 102, 255, 0.2)'],
          borderColor: ['rgba(153, 102, 255, 1)'],
          borderWidth: 1
        }]
      },
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams
      .subscribe((params) => {
        this.annonceId = _.get(params, 'id');
      });

    this.annonce = this.activatedRoute.snapshot.data['annonce'];
    this.options = this.getOptions();

    this.createConsoChart();
    this.createFiscaleChart();
    this.createReelleChart();

    //@ts-ignore
    $('#myCarousel').carousel();
  }

}
