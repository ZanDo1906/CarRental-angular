import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { iCar } from '../interfaces/Car';
@Injectable({
  providedIn: 'root',
})
export class CarService {
  url: string = './data/data/Car.json';

  constructor(private _http: HttpClient) { }

  getAllCars(): Observable<iCar[]> {
    return this._http
      .get<iCar[]>(this.url);
  }
}