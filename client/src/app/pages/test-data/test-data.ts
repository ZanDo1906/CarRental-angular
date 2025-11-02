import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CarService } from '../../services/car';
import { CommonModule } from '@angular/common';
import { NgForOf } from '@angular/common';


@Component({
  selector: 'app-test-data',
  standalone: true,
  imports: [CommonModule, NgForOf],
  templateUrl: './test-data.html',
  styleUrl: './test-data.css',
})
export class TestData implements OnInit {
  cars: any;
  constructor(private _carService: CarService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this._carService.getAllCars().subscribe({
      next: (data) => {
        this.cars = data;
        this.cdr.detectChanges();
      }
    });
  }

}
