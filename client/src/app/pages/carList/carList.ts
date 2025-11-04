import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CarService } from '../../services/car';
import { LocationService } from '../../services/location';

type FilterKey = 'location' | 'brand' | 'type' | 'seat' | 'fuel' | 'price'|  'purpose';

@Component({
  selector: 'app-carList',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carList.html',
  styleUrls: ['./carList.css'],
})
export class CarList implements OnInit {
  cars: any[] = [];
  visibleCars: any[] = [];
  filtered: any[] = [];       // danh sách đã lọc
  pageSize = 8;               // số card hiển thị mỗi lần
  openKey: FilterKey | null = null;

  // inject location service so we can resolve Ma_vi_tri → address
  users: any[] = [];
  locations: any[] = [];

  constructor(private carService: CarService, private _locationService: LocationService,  private router: Router,) {}

  goToCarDetail(id: number | string) {
      this.router.navigate(['/xe', id]);   // trỏ đúng path ở routes
    }

  ngOnInit() {
    this.carService.getAllCars().subscribe((data: any) => {
      this.cars = Array.isArray(data) ? data : [];
      this.applyFilter();
    });

    // load locations same way as TestData component
    this._locationService.getAllLocations().subscribe({
      next: (data: any) => {
        this.locations = Array.isArray(data) ? data : [];
      }
    });

      
    }

  // giá tiền format
  vnd(n: number | string | undefined) {
  if (n == null) return '';
  const x = typeof n === 'number' ? n : Number(n);
  return x.toLocaleString('vi-VN');   // chỉ số, KHÔNG kèm đơn vị
  }


  // trạng thái filter
  filters = {
    location: null as string | null,
    purpose: null as string | null,
    brand: null as string | null,
    type: null as string | null,
    seat: null as string | null,
    fuel: null as string | null,
    price: null as string | null,
    
  };

  // mở/đóng dropdown
  toggleDropdown(key: FilterKey) {
    this.openKey = this.openKey === key ? null : key;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.dropdown')) this.openKey = null;
  }

  // chọn 1 giá trị và lọc ngay
  selectOption(key: FilterKey, value: string | null) {
    this.filters[key] = value;
    this.openKey = null;
    this.applyFilter();
  }

  // lọc thật
  applyFilter() {
    let list = [...this.cars];

    if (this.filters.location)
      list = list.filter(c => (c.Dia_diem || '').includes(this.filters.location!));
    if (this.filters.brand)
      list = list.filter(c => (c.Hang_xe || '').includes(this.filters.brand!));
    if (this.filters.type)
      list = list.filter(c => (c.Loai_xe || '').includes(this.filters.type!));
    if (this.filters.seat)
      list = list.filter(c => c.So_cho == this.filters.seat);
    if (this.filters.fuel)
      list = list.filter(c => (c.Nhien_lieu || '').includes(this.filters.fuel!));
    if (this.filters.price) {
      const n = (x: any) => Number(x?.Gia_thue || 0);
      if (this.filters.price === '<800k') list = list.filter(x => n(x) < 800000);
      else if (this.filters.price === '800k–1tr') list = list.filter(x => n(x) >= 800000 && n(x) <= 1000000);
      else if (this.filters.price === '>1tr') list = list.filter(x => n(x) > 1000000);
    }

    this.filtered = list;                          // lưu full list đã lọc
    this.visibleCars = this.filtered.slice(0, this.pageSize);   // hiển thị đợt đầu
  }

  loadMore() {
  const next = this.filtered.slice(this.visibleCars.length, this.visibleCars.length + this.pageSize);
  this.visibleCars = this.visibleCars.concat(next);
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

  getStars(rating: number): string {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  }

}
