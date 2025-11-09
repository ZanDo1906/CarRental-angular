import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { SideBar } from '../side-bar/side-bar';
import { CarService } from '../../services/car';
import { LocationService } from '../../services/location';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';
import { Inject } from '@angular/core';
import { OwnerService } from '../../services/owner.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

// User car list for the first user
@Component({
  selector: 'app-user-car',
  standalone: true,
  imports: [CommonModule, RouterModule, SideBar],
  templateUrl: './user-car.html',
  styleUrls: ['./user-car.css'],
})
export class UserCar implements OnInit, OnDestroy, AfterViewInit {
  cars: any[] = [];
  locations: any[] = [];
  loading = true;
  // pagination
  pageSize = 6;
  currentPage = 1;

  ownerId: number | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private carService: CarService,
    private locationService: LocationService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(OwnerService) private ownerService: OwnerService
  ) {}
   vnd(n: number | string | undefined) {
  if (n == null) return '';
  const x = typeof n === 'number' ? n : Number(n);
  return x.toLocaleString('vi-VN');   // chỉ số, KHÔNG kèm đơn vị
  }

  ngOnInit(): void {
    // Subscribe để lắng nghe navigation events
    this.subscriptions.push(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        if (event.url === '/user-car') {
          // Force reload data khi navigate đến trang này
          this.initializeData();
        }
      })
    );

    // Load data lần đầu
    this.initializeData();
  }

  ngAfterViewInit() {
    // Force load data sau khi view init
    setTimeout(() => {
      if (!this.cars.length && !this.loading) {
        this.initializeData();
      }
      // Force change detection
      this.cdr.detectChanges();
    }, 100);
    
    // Thêm một trigger sau để đảm bảo UI update
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 200);
  }

  ngOnDestroy() {
    // Cleanup subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeData() {
    // Lấy user hiện tại từ AuthService
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser) {
      this.ownerId = currentUser.Ma_nguoi_dung;
      this.loadUserData();
    } else {
      // Fallback cho testing
      this.loadUserDataFallback();
    }
  }

  private loadUserData() {
    if (!this.ownerId) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges(); // Update loading state immediately

    // Load cars và locations cùng lúc
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

      // Ensure pagination resets when owner changes
      this.currentPage = 1;
      this.loading = false;

      // Force change detection để ensure UI update
      this.cdr.detectChanges();
      
      // Thêm một chút delay để đảm bảo layout render
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 50);
    });

    // Load locations
    try {
      this.locationService.getAllLocations().subscribe((data: any) => {
        this.locations = Array.isArray(data) ? data : [];
      });
    } catch (e) {
      // ignore if LocationService is not available
    }
  }

  private loadUserDataFallback() {
    // Fallback logic khi không có user từ AuthService
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

      this.loadUserData();
    });
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

  // Method để force reload data (có thể gọi từ bên ngoài)
  refreshData(): void {
    this.initializeData();
  }

  // Method để force refresh UI
  forceUIUpdate(): void {
    this.cdr.detectChanges();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 50);
  }
}