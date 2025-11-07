import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SideBar } from '../side-bar/side-bar';
import { CarService } from '../../services/car';
import { LocationService } from '../../services/location';
import { UserService } from '../../services/user';
import { CarRental } from '../../services/car-rental';
import { iCar_rental } from '../../interfaces/Car_rental';
import { iCar } from '../../interfaces/Car';
import { iLocation } from '../../interfaces/location';

type RentalWithCar = iCar_rental & { car_details: iCar };

@Component({
  selector: 'app-user-rental',
  standalone: true,
  imports: [CommonModule, RouterModule, SideBar],
  templateUrl: './user-rental.html',
  styleUrls: ['./user-rental.css']
})
export class UserRental implements OnInit {
  rentals: RentalWithCar[] = [];
  locations: iLocation[] = [];
  loading = true;
  userId: number | null = null;
  pageSize = 6;
  currentPage = 1;

  constructor(
    private carRentalService: CarRental,
    private carService: CarService,
    private locationService: LocationService,
    private userService: UserService
  ) {
    const userId = localStorage.getItem('userId');
    this.userId = userId ? Number(userId) : null;
  }

  ngOnInit() {
    if (!this.userId) {
      console.error('No user logged in');
      return;
    }

    // Load locations for address display
    this.locationService.getAllLocations().subscribe(locations => {
      this.locations = locations;
    });

    // Load user's rentals with car details
    this.carRentalService.getUserRentals(this.userId).subscribe(rentals => {
      this.rentals = rentals;
      this.loading = false;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.rentals.length / this.pageSize);
  }

  get paginatedRentals(): RentalWithCar[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.rentals.slice(start, end);
  }

  getLocationAddress(locationId: number): string {
    const location = this.locations.find(loc => loc.Ma_vi_tri === locationId);
    if (!location) return 'N/A';
    return [
      location.Dia_chi_cu_the,
      location.Phuong_xa,
      location.Quan_huyen,
      location.Tinh_thanh
    ].filter(Boolean).join(', ');
  }

  getRentalStatusText(status: number): string {
    switch(status) {
      case 1: return 'Đang xử lý';
      case 2: return 'Đã xác nhận';
      case 3: return 'Đã huỷ';
      case 4: return 'Đã hoàn tất';
      default: return 'Không xác định';
    }
  }

  getRentalStatusClass(status: number): string {
    switch(status) {
      case 1: return 'status-processing';
      case 2: return 'status-confirmed';
      case 3: return 'status-cancelled';
      case 4: return 'status-completed';
      default: return 'status-unknown';
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  vnd(n: number | string | undefined): string {
    if (n == null) return '';
    const x = typeof n === 'number' ? n : Number(n);
    return x.toLocaleString('vi-VN');   // chỉ số, KHÔNG kèm đơn vị
  }
}