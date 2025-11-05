import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SideBar } from '../side-bar/side-bar';
import { CarService } from '../../services/car';
import { LocationService } from '../../services/location';
import { UserService } from '../../services/user';
import { Inject } from '@angular/core';
import { OwnerService } from '../../services/owner.service';

// User car list for the first user
@Component({
  selector: 'app-user-car',
  standalone: true,
  imports: [CommonModule, RouterModule, SideBar],
  templateUrl: './user-car.html',
  styleUrls: ['./user-car.css'],
})
export class UserCar implements OnInit {
  cars: any[] = [];
  locations: any[] = [];
  // pagination
  pageSize = 6;
  currentPage = 1;

  ownerId: number | null = null;

  constructor(
    private carService: CarService,
    private locationService: LocationService,
    private userService: UserService,
    @Inject(OwnerService) private ownerService: OwnerService
  ) {}
   vnd(n: number | string | undefined) {
  if (n == null) return '';
  const x = typeof n === 'number' ? n : Number(n);
  return x.toLocaleString('vi-VN');   // chỉ số, KHÔNG kèm đơn vị
  }

  ngOnInit(): void {
    // prefer ownerService stored owner id, otherwise fall back to first user
    const currentUserId = this.ownerService.getOwnerId();
    this.userService.getAllUsers().subscribe((users: any[]) => {
      const list = Array.isArray(users) ? users : [];
      if (currentUserId) {
        this.ownerId = Number(currentUserId);
      } else if (list.length > 0) {
        const first = list[0];
        this.ownerId = Number(first.Ma_nguoi_dung);
        try { this.ownerService.setOwnerId(this.ownerId); } catch (e) {}
      }

      // Now load cars and filter by ownerId (if available). Merge with any local extras.
      this.carService.getAllCars().subscribe((data: any) => {
        const all = Array.isArray(data) ? data : [];
            const merged = this.mergeExtras(all);
            if (this.ownerId != null) {
              this.cars = merged.filter((c: any) => Number(c.Ma_nguoi_dung) === this.ownerId);
              // fallback: if the chosen user has no cars, pick the owner from the first car in Car.json
              if ((!this.cars || this.cars.length === 0) && all.length > 0) {
                this.ownerId = Number(all[0].Ma_nguoi_dung);
                this.cars = merged.filter((c: any) => Number(c.Ma_nguoi_dung) === this.ownerId);
              }
            } else {
              this.cars = merged;
        }
            // debug: log ownerId and number of cars loaded and sample data
            try {
              console.log('[UserCar] ownerId=', this.ownerId, 'carsLoaded=', this.cars.length);
              console.log('[UserCar] cars sample=', JSON.stringify(this.cars.slice(0, 5)));
            } catch (e) {}
            // Ensure pagination resets when owner changes
            this.currentPage = 1;
      });
    });
    // load locations for resolving addresses
    try {
      (this.locationService as any).getAllLocations().subscribe((data: any) => {
        this.locations = Array.isArray(data) ? data : [];
      });
    } catch (e) {
      // ignore if LocationService is not available
    }
  }

  // Pagination helpers used by the template
  displayedCars(): any[] {
    // keep the name displayedUsers() for template compatibility but return cars
    const start = (this.currentPage - 1) * this.pageSize;
    return this.cars.slice(start, start + this.pageSize);
  }

  users(): any[] {
    // return full list for header count (template used users())
    return this.cars;
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.cars.length / this.pageSize));
  }

  totalPagesArray(): number[] {
    const n = this.totalPages();
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }

  nextPage(): void { this.goToPage(this.currentPage + 1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }

  getLocationAddress(id: number): string {
    if (!this.locations || !this.locations.length) return 'Chưa cập nhật';
    const l = this.locations.find((x: any) => x.Ma_vi_tri == id || x.Ma_vi_tri === String(id));
    if (!l) return 'Chưa cập nhật';
    return `${l.Dia_chi_cu_the || ''}${l.Phuong_xa ? ', ' + l.Phuong_xa : ''}${l.Quan_huyen ? ', ' + l.Quan_huyen : ''}${l.Tinh_thanh ? ', ' + l.Tinh_thanh : ''}`;
  }

  onAction(action: string, car: any) {
    if (action === 'view') {
      alert(`Xem chi tiết xe: ${car.Hang_xe} ${car.Dong_xe} - biển số: ${car.Bien_so || 'N/A'}`);
    } else if (action === 'approve') {
      alert(`Đã duyệt xe: ${car.Hang_xe} ${car.Dong_xe}`);
    } else if (action === 'reject') {
      alert(`Đã từ chối duyệt xe: ${car.Hang_xe} ${car.Dong_xe}`);
    }
  }

  // load extras and merge when loading cars
  private mergeExtras(all: any[]) {
    const key = 'extraCars';
    try {
      const raw = localStorage.getItem(key);
      const extras = raw ? JSON.parse(raw) : [];
      const merged = all.map((c: any) => {
        const e = extras.find((x: any) => Number(x.Ma_xe) === Number(c.Ma_xe));
        return e ? Object.assign({}, c, e) : c;
      });
      // include extras that are new (Ma_xe not present in asset list)
      const extraNew = extras.filter((x: any) => !all.find((a: any) => Number(a.Ma_xe) === Number(x.Ma_xe)));
      return [...merged, ...extraNew];
    } catch (e) {
      return all;
    }
  }
}