import { iLocation } from './../interfaces/location';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class LocationService {
  url: string = '/assets/data/location.json';

  constructor(private _http: HttpClient) { }

  getAllLocations(): Observable<iLocation[]> {
    return this._http
      .get<iLocation[]>(this.url);
  }
}