import { Component, OnInit } from '@angular/core';
import { CarService } from '../../services/car';
import { CommonModule } from '@angular/common';
import { NgForOf } from '@angular/common';


@Component({
  selector: 'app-test-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-data.html',
  styleUrl: './test-data.css',
})
export class TestData implements OnInit {
  cars: any[] = [];
  constructor(private _pService: CarService) { }
  ngOnInit(): void {
    console.log('TestData component initialized');
    this._pService.getAllCars().subscribe({
      next: (data) => {
        console.log('Data received:', data);
        this.cars = data;
      },
      error: (error) => {
        console.error('Error loading cars:', error);
      }
    });
  }

}
