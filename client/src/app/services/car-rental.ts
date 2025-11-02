import { iCar_rental } from './../interfaces/Car_rental';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CarRental {
  url: string = '/assets/data/Car_rental.json';

  constructor(private _http: HttpClient) { }

  getAllCars(): Observable<iCar_rental[]> {
    return this._http
      .get<iCar_rental[]>(this.url);
  }
}