/// <reference types="googlemaps" />

import _ from 'lodash';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Constants } from '../constants';
import { FormDataService } from '../services/form-data.service';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})

export class PlanComponent implements OnInit, AfterViewInit {

  @ViewChild('map', { static: false }) mapElement: any;
  @ViewChild('cdZoomIn', { static: false }) zoomOutElement: any;
  @ViewChild('cdZoomOut', { static: false }) zoomInElement: any;

  map: google.maps.Map;
  markerUrl: '../../assets/images/marker.png';
  position: any = { lat: 48.4603297, lng: 2.8740947 };
  contactForm: FormGroup;
  name: '';
  email: '';
  subject: '';
  message: '';
  submitting: boolean;
  rejected: boolean;
  accepted: boolean;
  disableButton: boolean;

  constructor(
    private fb: FormBuilder,
    private formDataService: FormDataService
  ) { }

  customZooms() {
    const zoomControlDiv = document.createElement('div');
    const map = this.map;
    const zoomOutElement = this.zoomOutElement.nativeElement;
    const zoomInElement = this.zoomInElement.nativeElement;

    zoomControlDiv.appendChild(zoomOutElement);
    zoomControlDiv.appendChild(zoomInElement);

    google.maps.event.addDomListener(zoomInElement, 'click', () => map.setZoom(map.getZoom() - 1));
    google.maps.event.addDomListener(zoomOutElement, 'click', () => map.setZoom(map.getZoom() + 1));

    this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(zoomControlDiv);
  }

  initMarkers() {
    const pinColor = '#ef4b4b';
    const pinLabel = '51 Avenue de la Libération 77830 Pamfou';

    const pinSVGHole = 'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,' +
      '1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,' +
      '7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z';
    const labelOriginHole = new google.maps.Point(20, -5);
    const markerImage = {
      path: pinSVGHole,
      anchor: new google.maps.Point(12, 57),
      fillOpacity: 1,
      fillColor: pinColor,
      strokeWeight: 2,
      strokeColor: '#A9040A',
      scale: 2,
      labelOrigin: labelOriginHole
    };

    return new google.maps.Marker({
      map: this.map,
      label: {
        text: pinLabel,
        color: 'white',
        fontSize: '12px'
      },
      position: this.position,
      icon: markerImage
    });
  }

  initMap() {
    const mapProperties = {
      center: this.position,
      zoom: 13,
      gestureHandling: 'none',
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: Constants.MAP_STYLES
    };

    // @ts-ignore
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);
  }

  onChanges(): void {
    this.contactForm.valueChanges.subscribe(values => {
      if (this.submitting) return;
      if (!values.name || !values.email || !values.message) {
        this.disableButton = true;
      } else this.disableButton = false;
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.initMarkers();
    this.customZooms();
    this.onChanges();
    $('.alert').hide();
  }

  showAlert(type) {
    this.disableButton = true;
    $(`.alert-${type}`).show('fast');
    $('#contact-form').css({ opacity: .5 });
    setTimeout(() => {
      $(`.alert-${type}`).hide('fast');
      $('#contact-form').css({ opacity: 1 });
      this.contactForm.reset();
      this.contactForm.enable();
    }, 4000);
  }

  onSubmit(): Promise<any> {
    const { name, email, message } = this.contactForm.value;
    if (!name || !email || !message) return;

    const isValue = val => (_.size(val) ? true : false);

    this.submitting = true;
    this.contactForm.disable();

    return this.formDataService.contactForm(this.contactForm.value)
      .then(({ rejected, accepted }) => {
        setTimeout(() => {
        this.rejected = isValue(rejected);
        this.accepted = isValue(accepted);
        const alertType = accepted ? 'primary' : 'warning';
        this.showAlert(alertType);
        this.submitting = false;
        }, 4000);
      });
  }

  ngOnInit(): void {
    this.disableButton = true;
    this.submitting = false;
    this.rejected = false;
    this.accepted = false;

    this.contactForm = this.fb.group({
      name: [null],
      email: [null],
      subject: [null],
      message: [null]
    });
  }

}
