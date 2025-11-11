import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OwnerService } from '../../services/owner.service';
import carsData from '../../../assets/data/Car.json';
import usersData from '../../../assets/data/User.json';
@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vehicle-management.html',
  styleUrl: './vehicle-management.css',
})
export class VehicleManagement {
  cars = carsData;
  currentPage = 1;
  pageSize = 10;

  get pagedCars() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.cars.slice(start, start + this.pageSize);
  }

  setPage(page: number) {
    this.currentPage = page;
  }
  users = usersData;
  constructor(
    private router: Router,
    private ownerService: OwnerService
  ) { }

  getOwnerName(car: any): string {
    if (!car || car.Ma_nguoi_dung == null) return '';
    const u = this.users.find((x: any) => x.Ma_nguoi_dung === car.Ma_nguoi_dung);
    return u ? u.Ho_va_ten : '';
  }

  viewCarDetail(car: any): void {
    if (car && car.Ma_xe) {
      // store selected car id (used elsewhere) and navigate with id param
      this.ownerService.setOwnerId(car.Ma_xe);
      this.router.navigate(['/vehicle-detail', car.Ma_xe]);
    }
  }

  get totalPages() {
    return Math.ceil(this.cars.length / this.pageSize);
  }
}