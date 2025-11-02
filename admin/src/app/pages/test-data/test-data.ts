import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CarService } from '../../services/car';
import { UserService } from '../../services/user';
import { CarRental } from '../../services/car-rental';
import { LocationService } from '../../services/location';
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
  rentals: any;
  locations: any;
  Array = Array; // Expose Array to template

  constructor(
    private _carService: CarService,
    private _userService: UserService,
    private _rentalService: CarRental,
    private _locationService: LocationService,
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

    // Load rentals data
    this._rentalService.getAllCars().subscribe({
      next: (data) => {
        this.rentals = data;
        this.cdr.detectChanges();
      }
    });

    // Load locations data
    this._locationService.getAllLocations().subscribe({
      next: (data) => {
        this.locations = data;
        this.cdr.detectChanges();
      }
    });
  }

  getRoleName(role: string): string {
    switch (role) {
      case '1': return 'Người thuê';
      case '2': return 'Chủ xe';
      case '3': return 'Quản trị viên';
      default: return role;
    }
  }

  getRentalStatus(status: number): string {
    switch (status) {
      case 1: return 'Đang xử lý';
      case 2: return 'Đã xác nhận';
      case 3: return 'Đã hủy';
      case 4: return 'Đã hoàn tất';
      default: return 'Không xác định';
    }
  }

  getLocationById(id: number): any {
    return this.locations?.find((loc: any) => loc.Ma_vi_tri == id);
  }

  getLocationAddress(id: number): string {
    const location = this.getLocationById(id);
    if (location) {
      return `${location.Dia_chi_cu_the}, ${location.Phuong_xa}, ${location.Quan_huyen}, ${location.Tinh_thanh}`;
    }
    return 'Chưa cập nhật';
  }

  getCarById(id: number): any {
    return this.cars?.find((car: any) => car.Ma_xe == id);
  }

  getCarName(id: number): string {
    const car = this.getCarById(id);
    if (car) {
      return `${car.Hang_xe} ${car.Dong_xe}`;
    }
    return 'Chưa xác định';
  }

  getCarOwnerName(carId: number): string {
    const car = this.getCarById(carId);
    if (car && car.Ma_nguoi_dung) {
      const owner = this.getUserById(car.Ma_nguoi_dung);
      return owner ? owner.Ho_va_ten : 'Chưa xác định';
    }
    return 'Chưa xác định';
  }

  getUserById(id: number): any {
    return this.users?.find((user: any) => user.Ma_nguoi_dung == id);
  }

  getUserName(id: number): string {
    const user = this.getUserById(id);
    return user ? user.Ho_va_ten : 'Chưa xác định';
  }

}