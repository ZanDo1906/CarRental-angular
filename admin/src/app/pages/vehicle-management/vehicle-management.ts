import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CarService } from '../../services/car';
import { iCar } from '../../interfaces/Car';


@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './vehicle-management.html',
  styleUrls: ['./vehicle-management.css'],
})
export class VehicleManagement implements OnInit {
  cars: iCar[] = [];

  Array = Array; // Expose Array to template

  constructor(private carService: CarService) { }

  ngOnInit(): void {
    this.carService.getAllCars().subscribe((data) => {
      this.cars = data;
    });
  }
}
