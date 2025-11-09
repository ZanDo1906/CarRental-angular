import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { SideBar } from '../side-bar/side-bar';
import { CarService } from '../../services/car';
import { LocationService } from '../../services/location';
import { AuthService } from '../../services/auth';
import { CarRental } from '../../services/car-rental';
import { iCar_rental } from '../../interfaces/Car_rental';
import { iCar } from '../../interfaces/Car';
import { iLocation } from '../../interfaces/location';
import { forkJoin, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

type RentalWithCar = iCar_rental & { car_details: iCar };

@Component({
  selector: 'app-user-rental',
  standalone: true,
  imports: [CommonModule, RouterModule, SideBar],
  templateUrl: './user-rental.html',
  styleUrls: ['./user-rental.css']
})
export class UserRental implements OnInit, OnDestroy, AfterViewInit {
  rentals: RentalWithCar[] = [];
  locations: iLocation[] = [];
  loading = true;
  userId: number | null = null;
  pageSize = 6;
  currentPage = 1;
  private subscriptions: Subscription[] = [];

  get paginatedRentals(): RentalWithCar[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.rentals.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.rentals.length / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  constructor(
    private carRentalService: CarRental,
    private carService: CarService,
    private locationService: LocationService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    // Constructor không cần lấy user, sẽ làm trong ngOnInit
  }

  ngOnInit() {
    // Subscribe để lắng nghe navigation events
    this.subscriptions.push(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        if (event.url === '/user-rental') {
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
      if (!this.rentals.length && !this.loading) {
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
    // Lấy user hiện tại ngay lập tức từ AuthService
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser) {
      this.userId = currentUser.Ma_nguoi_dung;
      this.loadUserData();
    } else {
      // Fallback cho testing - có thể bỏ trong production
      this.userId = 1;
      this.loadUserData();
    }

    // Chỉ subscribe một lần để tránh duplicate
    if (this.subscriptions.length <= 1) { // Chỉ có router subscription
      const userSub = this.authService.currentUser$.subscribe(user => {
        if (user && (!this.userId || user.Ma_nguoi_dung !== this.userId)) {
          this.userId = user.Ma_nguoi_dung;
          this.loadUserData();
        }
      });
      this.subscriptions.push(userSub);
    }
  }

  private loadUserData() {
    if (!this.userId) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }
    
    // Load tất cả data cùng lúc để tăng tốc độ
    this.loading = true;
    this.cdr.detectChanges(); // Update loading state immediately
    
    forkJoin({
      rentals: this.carRentalService.getAllCars(),
      cars: this.carService.getAllCars(),
      locations: this.locationService.getAllLocations()
    }).subscribe({
      next: ({ rentals, cars, locations }: { rentals: iCar_rental[], cars: iCar[], locations: iLocation[] }) => {
        // Set locations
        this.locations = locations;
        
        // Filter user rentals
        const userRentals = rentals.filter((rental: iCar_rental) => {
          return rental.Ma_nguoi_thue === this.userId;
        });
        
        // Map with car details
        this.rentals = userRentals.map((rental: iCar_rental) => {
          const car = cars.find((c: iCar) => c.Ma_xe === rental.Ma_xe);
          return { ...rental, car_details: car! };
        });
        
        this.loading = false;
        
        // Force change detection để ensure UI update
        this.cdr.detectChanges();
        
        // Thêm một chút delay để đảm bảo layout render
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 50);
      },
      error: (error: any) => {
        console.error('Error loading rentals:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
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