import { iCar_rental } from './../interfaces/Car_rental';
import { iCar } from './../interfaces/Car';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, mergeMap, forkJoin } from 'rxjs';
import { CarService } from './car';

@Injectable({
  providedIn: 'root',
})
export class CarRental {
  url: string = '/assets/data/Car_rental.json';

  constructor(
    private _http: HttpClient,
    private carService: CarService
  ) { }

  getAllCars(): Observable<iCar_rental[]> {
    return this._http.get<iCar_rental[]>(this.url);
  }

  getRentalWithCarDetails(rental: iCar_rental, cars: iCar[]): iCar_rental & { car_details: iCar } {
    const car = cars.find(car => car.Ma_xe === rental.Ma_xe);
    return {
      ...rental,
      car_details: car!
    };
  }

  getUserRentals(userId: number): Observable<(iCar_rental & { car_details: iCar })[]> {
    return forkJoin({
      rentals: this.getAllCars(),
      cars: this.carService.getAllCars()
    }).pipe(
      map(({ rentals, cars }) => {
        const userRentals = rentals.filter(rental => rental.Ma_nguoi_thue === userId);
        return userRentals.map(rental => this.getRentalWithCarDetails(rental, cars));
      })
    );
  }
}