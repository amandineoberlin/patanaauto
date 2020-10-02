import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class BuildVersionCheckService {
  // this will be replaced by actual hash post-build.js
  private currentHash = '{{POST_BUILD_ENTERS_HASH_HERE}}';
  private versionUrl = '/version.json';
  private emptyCachesUrl = '/clear-caches';

  constructor(private http: HttpClient) {}

  public frequencyCheck() {
    // every 30 minutes
    return 1000 * 60 * 30;
  }

  public initVersionCheck() {
    this.checkVersion(this.versionUrl);
    this.emptyCaches();
    // setInterval(() => {
    //     this.checkVersion(this.versionUrl);
    // }, frequency);
  }

  private checkVersion(url) {
    // timestamp these requests to invalidate caches
    this.http.get(url + '?t=' + new Date().getTime())
      .subscribe((response: any) => {
        const hash = response.hash;
        const hashChanged = this.hasHashChanged(this.currentHash, hash);

        if (hashChanged) this.emptyCaches();
        this.currentHash = hash;

      }, err => console.error('Error: could not get build version', err)
    );
  }

  private emptyCaches() {
    return this.http.get(this.emptyCachesUrl)
      .subscribe((response: any) => {
        if (response.success) console.log('emptied caches successfully due to new app version');
      }, err => console.log('Error: could not empty caches', err))
  }

  private hasHashChanged(currentHash, newHash) {
    const noHash = !currentHash || currentHash === '{{POST_BUILD_ENTERS_HASH_HERE}}';
    return noHash ? false : currentHash !== newHash;
  }
}
