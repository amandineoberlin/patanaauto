import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  constructor(
    private http: HttpClient
  ) { }

  title = 'Patana Auto';

  ngOnInit() {
    console.log('not clearing caches')
    // return this.http.get<any[]>('clear-caches')
    //   .toPromise();
  }
}
