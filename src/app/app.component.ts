import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// import { VersionCheckService } from './services/version-check.service';

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  constructor(
    // private versionService: VersionCheckService,
    private http: HttpClient
  ) { }

  title = 'Patana Auto';

  ngOnInit() {
    // TEMPORAIRE (en attendant meilleure solution)
    // this.versionService.initVersionCheck();
    return this.http.get<any[]>('clear-caches')
      .toPromise();
  }
}
