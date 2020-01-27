import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor() { }

  images: Array<string>;

  ngOnInit(): void {
    this.images = [
      'office1.JPG',
      'office2.JPG',
      'office3.JPG',
      'parc1.JPG',
      'parc2.JPG',
      'parc3.JPG',
      'parc4.JPG'
    ];
  }

}
