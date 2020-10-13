import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class VersionCheckService {
  // this will be replaced by actual hash post-build.js
  private currentHash = '{{POST_BUILD_ENTERS_HASH_HERE}}';
  private buildVersionUrl = '/build-version.json';
  private annoncesVersionUrl = 'assets/annonces-version.json';
  private emptyCachesUrl = '/clear-caches';
  private annoncesVersion = null;
  private annoncesHash = null;

  constructor(private http: HttpClient) {}

  public frequencyCheck() {
    // every 30 minutes
    return 1000 * 60 * 30;
  }

  public initVersionCheck() {
    this.checkAnnoncesChanges();

    const frequency = this.frequencyCheck();
    setInterval(() => {
        this.checkBuildVersion();
    }, frequency);
  }

  private setLocalStorageValues() {
    localStorage.setItem('annoncesVersion', this.annoncesVersion);
    localStorage.setItem('annoncesHash', this.annoncesHash);
  }

  private checkAnnoncesChanges() {
    if (typeof(Storage) !== 'undefined') {
      const currentVersion = localStorage.getItem('annoncesVersion');
      const currentHash = localStorage.getItem('annoncesHash');
      const hashValue = `${currentVersion}${currentHash}`;

      return this.checkForAnnoncesChange(hashValue)
        .then((isChanged) => {
          if (!currentVersion || !currentHash) return this.setLocalStorageValues();
          if (!isChanged) return;
          this.emptyCaches('annonces list');
          this.emptyStorage();
          this.setLocalStorageValues();
        });
    }
  }

  private checkBuildVersion() {
    // timestamp these requests to invalidate caches
    this.http.get(this.buildVersionUrl + '?t=' + new Date().getTime())
      .toPromise()
      .then((response: any) => {
        const hash = response.hash;
        const hashChanged = this.hasBuildHashChanged(this.currentHash, hash);

        if (hashChanged) this.emptyCaches('app build');
        this.currentHash = hash;
      }, err => console.error('Error: could not get build version', err)
    );
  }

  private emptyCaches(kind) {
    return this.http.get(this.emptyCachesUrl)
      .toPromise()
      .then((response: any) => {
        if (response.success) console.log(`emptied caches successfully due to new ${kind} version`);
      }, err => console.log('Error: could not empty caches', err));
  }

  private emptyStorage() {
    sessionStorage.clear();
    localStorage.clear();
  }

  private hasBuildHashChanged(currentHash, newHash) {
    const noHash = !currentHash || currentHash === '{{POST_BUILD_ENTERS_HASH_HERE}}';
    return noHash ? false : currentHash !== newHash;
  }

  private checkForAnnoncesChange(currentHash) {
    return this.http.get(this.annoncesVersionUrl)
      .toPromise()
      .then((response: any) => {
        const { version, hash } = response;
        const newHash = `${version}${hash}`;
        this.annoncesVersion = version;
        this.annoncesHash = hash;
        return newHash !== currentHash;
      }, err => console.error('Error: could not get annonces version', err)
    );
  }
}
