import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor() { }

  images: Array<string>;

  changeActiveItem(i) {
    $('.carousel-indicators').children().each(function(index) {
      if ($(this).hasClass('active')) $(this).removeClass('active');
      if (index !== i) return;

      $(this).addClass('active');
      $('.carousel-inner').children().each(function(index2) {
        if (index2 !== i && $(this).hasClass('active')) $(this).removeClass('active');
        if (index2 === i) $(this).addClass('active');
        // @ts-ignore
        $('#myCarousel2').carousel('pause');
      });
    });
  }

  ngOnInit(): void {
    this.images = [
      'parc7.JPG',
      'parc9.JPG',
      'parc10.JPG',
      'office1.JPG',
      'drone2.jpg'
    ];

    // @ts-ignore
    $('#myCarousel2').carousel({ pause: false });
  }

}
