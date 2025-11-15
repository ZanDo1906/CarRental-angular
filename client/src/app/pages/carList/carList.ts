import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CarService } from '../../services/car';
import { LocationService } from '../../services/location';
import { BookingDataService } from '../../services/booking-data';

type FilterKey = 'location' | 'brand' | 'type' | 'seat' | 'fuel' | 'price' | 'purpose' | 'transmission' | 'consumption' | 'rating';

// Định nghĩa mục đích chuyến đi
export const PURPOSES = [
  'Đi trong phố',
  'Đi xa / đi tỉnh',
  'Gia đình / nhóm 6-7 chỗ',
  'Chở hàng / công trình',
  'Sang trọng / sự kiện',
  'Tiết kiệm ngân sách',
  'Cho người mới lái',
] as const;
export type Purpose = typeof PURPOSES[number];

// Logic matching xe theo mục đích
function matchPurpose(car: any, purpose: Purpose): boolean {
  switch (purpose) {
    case 'Đi trong phố':
      return ['Hatchback','Sedan'].includes(car.Loai_xe)
          && car.So_cho <= 5
          && (car.Muc_tieu_thu || 0) <= 7;

    case 'Đi xa / đi tỉnh':
      return ['Sedan','SUV/CUV'].includes(car.Loai_xe)
          && (car.Muc_tieu_thu || 0) <= 7.5;

    case 'Gia đình / nhóm 6-7 chỗ':
      return car.So_cho >= 6 || (car.Loai_xe === 'SUV/CUV' && car.So_cho >= 5);

    case 'Chở hàng / công trình':
      return car.Loai_xe === 'Bán tải'
          || (car.Loai_xe === 'SUV/CUV' && car.Nhien_lieu === 'Dầu');

    case 'Sang trọng / sự kiện':
      return (car.Gia_thue || 0) >= 1_000_000
          || /Lux|Camry|Mercedes|BMW|Audi/i.test(`${car.Hang_xe} ${car.Dong_xe}`);

    case 'Tiết kiệm ngân sách':
      return (car.Gia_thue || 0) <= 700_000 || (car.Muc_tieu_thu || 0) <= 6.2;

    case 'Cho người mới lái':
      return (car.Hop_so || '').includes('Tự động')
          && ['Hatchback','Sedan','MPV'].includes(car.Loai_xe)
          && car.So_cho <= 7;
    
    default:
      return false;
  }
}

@Component({
  selector: 'app-car-list',
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
  availableLocations: string[] = []; // Danh sách địa điểm có xe sẵn sàng cho thuê
  
  // Mục đích chuyến đi
  readonly PURPOSES = PURPOSES;

  // Booking times
  pickupTime: string = '';
  returnTime: string = '';
  dateError: string = '';
  minDateTime: string = '';

  constructor(
    private carService: CarService, 
    private _locationService: LocationService, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    private bookingDataService: BookingDataService
  ) {}

  goToCarDetail(id: number | string) {
      // Lưu dữ liệu booking vào service trước khi navigate
      this.bookingDataService.setBookingData({
        location: this.filters.location,
        pickupTime: this.pickupTime || '',
        returnTime: this.returnTime || ''
      });
      this.router.navigate(['/xe', id]);   // trỏ đúng path ở routes
    }

  ngOnInit() {
    // Set min datetime to current time
    this.setMinDateTime();
    
    // Load locations trước
    this._locationService.getAllLocations().subscribe({
      next: (data: any) => {
        this.locations = Array.isArray(data) ? data : [];
        // Sau khi load locations, cập nhật danh sách địa điểm có xe sẵn sàng
        this.updateAvailableLocations();
      }
    });

    // Load cars và hiển thị
    this.carService.getAllCars().subscribe((data: any) => {
      // Lọc chỉ lấy các xe sẵn sàng cho thuê
      const allCars = Array.isArray(data) ? data : [];
      this.cars = allCars.filter((car: any) => car.Tinh_trang_xe === 'Sẵn sàng cho thuê');
      console.log('Tổng số xe:', allCars.length);
      console.log('Số xe sẵn sàng cho thuê:', this.cars.length);
      
      // Nhận dữ liệu booking từ homepage (nếu có)
      const bookingData = this.bookingDataService.getBookingData();
      if (bookingData.location) {
        this.filters.location = bookingData.location;
      }
      if (bookingData.pickupTime) {
        this.pickupTime = bookingData.pickupTime;
      }
      if (bookingData.returnTime) {
        this.returnTime = bookingData.returnTime;
      }
      
      // Apply filter nếu có location, nếu không thì hiện tất cả
      if (this.filters.location) {
        this.applyFilter();
      } else {
        this.filtered = [...this.cars];
        this.visibleCars = this.filtered.slice(0, this.pageSize);
      }
      
      // Sau khi load cars, cập nhật danh sách địa điểm có xe sẵn sàng
      this.updateAvailableLocations();
      
      // Force update UI
      this.cdr.detectChanges();
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
    transmission: null as string | null,
    consumption: null as string | null,
    rating: null as string | null,
  };

  // Sắp xếp theo giá
  sortOrder: 'asc' | 'desc' | null = null;

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

  // Reset tất cả bộ lọc và sắp xếp
  resetAllFilters() {
    this.filters = {
      location: null,
      brand: null,
      type: null,
      seat: null,
      fuel: null,
      price: null,
      purpose: null,
      transmission: null,
      consumption: null,
      rating: null
    };
    this.sortOrder = null;
    this.openKey = null;
    this.applyFilter();
  }

  // Thiết lập sắp xếp theo giá
  setSortOrder(order: 'asc' | 'desc' | null) {
    this.sortOrder = order;
    this.openKey = null;
    this.applyFilter();
  }

  // Xử lý chọn khoảng giá: lần 1 = lọc + tăng dần, lần 2+ = toggle tăng/giảm
  selectPriceOption(priceRange: string | null) {
    if (priceRange === null) {
      // "Tất cả" - giống các nút khác, nếu đang chọn thì toggle, chưa chọn thì tăng dần
      if (!this.filters.price && this.sortOrder) {
        // Đang ở trạng thái "Tất cả" với sort, toggle tăng/giảm
        if (this.sortOrder === 'asc') {
          this.sortOrder = 'desc';
        } else {
          this.sortOrder = 'asc';
        }
      } else {
        // Lần đầu hoặc từ khoảng giá khác: chuyển về "Tất cả" + tăng dần
        this.filters.price = null;
        this.sortOrder = 'asc';
      }
    } else {
      // Nếu cùng khoảng giá, toggle giữa tăng/giảm
      if (this.filters.price === priceRange) {
        if (this.sortOrder === 'asc') {
          this.sortOrder = 'desc'; // Từ tăng sang giảm
        } else {
          this.sortOrder = 'asc'; // Từ giảm sang tăng
        }
      } else {
        // Khoảng giá mới: lọc + tăng dần luôn
        this.filters.price = priceRange;
        this.sortOrder = 'asc';
      }
    }
    
    this.openKey = null;
    this.applyFilter();
  }

  // lọc thật
  applyFilter() {
    // Đảm bảo chỉ lấy xe sẵn sàng cho thuê
    let list = [...this.cars].filter((car: any) => car.Tinh_trang_xe === 'Sẵn sàng cho thuê');

    // Lọc theo địa điểm - dựa vào Ma_vi_tri và locations
    // Chỉ lọc nếu location có giá trị (không phải null/undefined)
    if (this.filters.location) {
      list = list.filter(c => {
        const location = this.getLocationById(c.Ma_vi_tri);
        return location && (location.Tinh_thanh || '').includes(this.filters.location!);
      });
    }
    
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
    
    // Truyền động
    if (this.filters.transmission) {
      const wanted = String(this.filters.transmission).toLowerCase();
      list = list.filter(c => String(c?.Hop_so || '').toLowerCase() === wanted);
    }
    
    // Mức tiêu thụ (giả sử có field Muc_tieu_thu, đơn vị l/100km)
    if (this.filters.consumption) {
      const n = (x: any) => Number(x?.Muc_tieu_thu || 0);
      if (this.filters.consumption === '<5l') list = list.filter(x => n(x) < 5);
      else if (this.filters.consumption === '5-8l') list = list.filter(x => n(x) >= 5 && n(x) <= 8);
      else if (this.filters.consumption === '>8l') list = list.filter(x => n(x) > 8);
    }
    
    // Đánh giá
    if (this.filters.rating) {
      const r = (x: any) => Number(x?.Diem_danh_gia || 0);
      if (this.filters.rating === '<3') list = list.filter(x => r(x) < 3);
      else if (this.filters.rating === '3-4') list = list.filter(x => r(x) >= 3 && r(x) < 4);
      else if (this.filters.rating === '4-4.5') list = list.filter(x => r(x) >= 4 && r(x) < 4.5);
      else if (this.filters.rating === '>=4.5') list = list.filter(x => r(x) >= 4.5);
    }
    
    // Mục đích chuyến đi - logic matching dựa trên thuộc tính xe
    if (this.filters.purpose) {
      list = list.filter(c => matchPurpose(c, this.filters.purpose as Purpose));
    }

    // Sắp xếp theo giá
    if (this.sortOrder) {
      list = list.sort((a, b) => {
        const priceA = Number(a.Gia_thue) || 0;
        const priceB = Number(b.Gia_thue) || 0;
        
        if (this.sortOrder === 'asc') {
          return priceA - priceB; // Tăng dần
        } else {
          return priceB - priceA; // Giảm dần
        }
      });
    }

    this.filtered = list;                          // lưu full list đã lọc
    this.visibleCars = this.filtered.slice(0, this.pageSize);   // hiển thị đợt đầu
  }

  loadMore() {
  const next = this.filtered.slice(this.visibleCars.length, this.visibleCars.length + this.pageSize);
  this.visibleCars = this.visibleCars.concat(next);
}

  // Cập nhật danh sách địa điểm có xe sẵn sàng cho thuê
  updateAvailableLocations(): void {
    // Chỉ cập nhật khi đã có cả cars và locations
    if (this.cars.length === 0 || this.locations.length === 0) {
      return;
    }

    // Lấy tất cả các xe sẵn sàng cho thuê
    const availableCars = this.cars.filter(car => 
      car.Tinh_trang_xe === 'Sẵn sàng cho thuê' && car.Ma_vi_tri != null
    );

    // Lấy danh sách Ma_vi_tri từ các xe sẵn sàng
    const locationIds = new Set<number>();
    availableCars.forEach(car => {
      if (car.Ma_vi_tri) {
        locationIds.add(Number(car.Ma_vi_tri));
      }
    });

    // Lấy danh sách Tinh_thanh từ locations và loại bỏ trùng lặp
    const uniqueProvinces = new Set<string>();
    locationIds.forEach(locationId => {
      const location = this.locations.find((loc: any) => 
        Number(loc.Ma_vi_tri) === locationId
      );
      if (location && location.Tinh_thanh) {
        uniqueProvinces.add(location.Tinh_thanh);
      }
    });

    // Chuyển Set thành Array và sắp xếp
    this.availableLocations = Array.from(uniqueProvinces).sort();
    console.log('Địa điểm có xe sẵn sàng (carList):', this.availableLocations);
    this.cdr.detectChanges();
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

  private setMinDateTime(): void {
    const now = new Date();
    // Format to YYYY-MM-DDTHH:mm for datetime-local input
    this.minDateTime = now.toISOString().slice(0, 16);
  }

  // Validate thời gian thuê/trả
  validateDates(): void {
    this.dateError = '';
    if (this.pickupTime && this.returnTime) {
      const pickup = new Date(this.pickupTime);
      const returnDate = new Date(this.returnTime);
      
      if (returnDate <= pickup) {
        this.dateError = 'Thời gian trả phải sau thời gian thuê';
        this.returnTime = '';
      }
    }
  }

}
