import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { } from 'googlemaps';

import { Constants } from '../constants';

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
  markerUrl: string = '../../assets/images/marker.png'
  position: any = { lat: 48.4603297, lng: 2.8740947 };

  constructor() { }

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
    const pinColor = "#ef4b4b";
    const pinLabel = "51 Avenue de la Libération 77830 Pamfou";

    const pinSVGHole = "M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z";
    const labelOriginHole = new google.maps.Point(20, -5);
    var markerImage = {
      path: pinSVGHole,
      anchor: new google.maps.Point(12, 57),
      fillOpacity: 1,
      fillColor: pinColor,
      strokeWeight: 2,
      strokeColor: "#A9040A",
      scale: 2,
      labelOrigin: labelOriginHole
    };

    const label = {
      text: pinLabel,
      color: "white",
      fontSize: "12px",
    };

    new google.maps.Marker({
      map: this.map,
      label: label,
      position: this.position,
      icon: markerImage,
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

    //@ts-ignore
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.initMarkers();
    this.customZooms();
  }

  ngOnInit(): void {
  }

}
