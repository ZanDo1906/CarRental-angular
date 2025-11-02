import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CarService } from '../../services/car';
import { UserService } from '../../services/user';
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
  users: any;

  constructor(
    private _carService: CarService,
    private _userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Load cars data
    this._carService.getAllCars().subscribe({
      next: (data) => {
        this.cars = data;
        this.cdr.detectChanges();
      }
    });

    // Load users data
    this._userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
      }
    });
  }

}
