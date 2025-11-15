import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CarService } from '../../services/car';
import { LocationService } from '../../services/location';
import { AuthService } from '../../services/auth';
import { CarRental } from '../../services/car-rental';
import { iCar_rental } from '../../interfaces/Car_rental';
import { iCar } from '../../interfaces/Car';
import { iLocation } from '../../interfaces/location';
import { forkJoin, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ReviewModalComponent } from '../../components/modals/review-modal/review-modal.component';
import { ComplaintModalComponent } from '../../components/modals/complaint-modal/complaint-modal.component';

type RentalWithCar = iCar_rental & { car_details: iCar };

@Component({
  selector: 'app-user-rental',
  standalone: true,
  imports: [CommonModule, RouterModule, ReviewModalComponent, ComplaintModalComponent],
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
  activeTab: 'current' | 'history' = 'current'; // Tab hiện tại
  private subscriptions: Subscription[] = [];

  // Filter states
  selectedStatusFilter: string = 'all';
  selectedTimeFilter: string = 'all';
  selectedPriceFilter: string = 'all';
  openDropdown: string | null = null;

  // Modal states
  showReviewModal = false;
  showComplaintModal = false;
  selectedRental: RentalWithCar | null = null;

  // Lọc chuyến hiện tại (status 1, 2, 3)
  get currentRentals(): RentalWithCar[] {
    return this.rentals.filter(r => 
      r.Trang_thai === 1 || r.Trang_thai === 2 || r.Trang_thai === 3
    );
  }

  // Lọc lịch sử chuyến (status 4, 5, 0)
  get historyRentals(): RentalWithCar[] {
    return this.rentals.filter(r => 
      r.Trang_thai === 4 || r.Trang_thai === 5 || r.Trang_thai === 0
    );
  }

  // Rentals theo tab hiện tại và các bộ lọc
  get filteredRentals(): RentalWithCar[] {
    let result = this.activeTab === 'current' ? this.currentRentals : this.historyRentals;
    
    // Chỉ áp dụng filter khi ở tab history
    if (this.activeTab === 'history') {
      result = this.applyFilters(result);
    }
    
    return result;
  }

  get paginatedRentals(): RentalWithCar[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredRentals.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRentals.length / this.pageSize);
  }

  // Chuyển tab
  switchTab(tab: 'current' | 'history'): void {
    this.activeTab = tab;
    this.currentPage = 1; // Reset về trang 1 khi chuyển tab
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Scroll lên đầu trang khi chuyển trang
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Filter methods
  applyFilters(rentals: RentalWithCar[]): RentalWithCar[] {
    let filtered = [...rentals];
    
    // Lọc theo trạng thái
    if (this.selectedStatusFilter !== 'all') {
      filtered = filtered.filter(rental => {
        switch (this.selectedStatusFilter) {
          case 'completed':
            return rental.Trang_thai === 4;
          case 'cancelled':
            return rental.Trang_thai === 5;
          case 'rejected':
            return rental.Trang_thai === 0;
          default:
            return true;
        }
      });
    }
    
    // Lọc theo thời gian
    if (this.selectedTimeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(rental => {
        const rentalDate = new Date(rental.Ngay_nhan_xe);
        
        switch (this.selectedTimeFilter) {
          case 'thisMonth':
            return rentalDate.getMonth() === now.getMonth() && 
                   rentalDate.getFullYear() === now.getFullYear();
          case 'lastMonth':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
            return rentalDate.getMonth() === lastMonth.getMonth() && 
                   rentalDate.getFullYear() === lastMonth.getFullYear();
          case 'last3Months':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3);
            return rentalDate >= threeMonthsAgo;
          case 'thisYear':
            return rentalDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }
    
    // Lọc theo giá
    if (this.selectedPriceFilter !== 'all') {
      filtered = filtered.filter(rental => {
        const price = rental.Tong_chi_phi || 0;
        
        switch (this.selectedPriceFilter) {
          case 'under1M':
            return price < 1000000;
          case '1M_3M':
            return price >= 1000000 && price < 3000000;
          case '3M_5M':
            return price >= 3000000 && price < 5000000;
          case 'over5M':
            return price >= 5000000;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }

  // Dropdown methods
  toggleDropdown(type: string): void {
    console.log('toggleDropdown called with:', type, 'current openDropdown:', this.openDropdown);
    this.openDropdown = this.openDropdown === type ? null : type;
    console.log('new openDropdown:', this.openDropdown);
  }

  selectStatusFilter(filter: string): void {
    this.selectedStatusFilter = filter;
    this.openDropdown = null;
    this.currentPage = 1;
  }

  selectTimeFilter(filter: string): void {
    this.selectedTimeFilter = filter;
    this.openDropdown = null;
    this.currentPage = 1;
  }

  selectPriceFilter(filter: string): void {
    this.selectedPriceFilter = filter;
    this.openDropdown = null;
    this.currentPage = 1;
  }

  // Filter text methods
  getStatusFilterText(): string {
    const statusMap: { [key: string]: string } = {
      'all': 'Tất cả',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
      'rejected': 'Bị từ chối'
    };
    return statusMap[this.selectedStatusFilter] || 'Tất cả';
  }

  getTimeFilterText(): string {
    const timeMap: { [key: string]: string } = {
      'all': 'Tất cả',
      'thisMonth': 'Tháng này',
      'lastMonth': 'Tháng trước',
      'last3Months': '3 tháng qua',
      'thisYear': 'Năm nay'
    };
    return timeMap[this.selectedTimeFilter] || 'Tất cả';
  }

  getPriceFilterText(): string {
    const priceMap: { [key: string]: string } = {
      'all': 'Tất cả',
      'under1M': 'Dưới 1 triệu',
      '1M_3M': '1 - 3 triệu',
      '3M_5M': '3 - 5 triệu',
      'over5M': 'Trên 5 triệu'
    };
    return priceMap[this.selectedPriceFilter] || 'Tất cả';
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

    // Add click listener to close dropdowns
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) {
        this.openDropdown = null;
        this.cdr.detectChanges();
      }
    });

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
    const location = this.locations.find(loc => loc.Ma_vi_tri == locationId);
    if (!location) return 'Chưa cập nhật';
    return `${location.Dia_chi_cu_the}, ${location.Phuong_xa}, ${location.Quan_huyen}, ${location.Tinh_thanh}`;
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

  // Lấy text trạng thái
  getStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'BỊ TỪ CHỐI',
      1: 'CHỜ DUYỆT',
      2: 'ĐÃ DUYỆT',
      3: 'ĐANG THUÊ',
      4: 'HOÀN THÀNH',
      5: 'ĐÃ HUỶ'
    };
    return statusMap[status] || 'Không xác định';
  }

  // Lấy class CSS cho status badge
  getStatusClass(status: number): string {
    const classMap: { [key: number]: string } = {
      0: 'status-rejected',
      1: 'status-pending',
      2: 'status-approved',
      3: 'status-ongoing',
      4: 'status-completed',
      5: 'status-cancelled'
    };
    return classMap[status] || '';
  }

  // Thuê lại - chuyển đến trang chi tiết xe
  rentAgain(rental: RentalWithCar): void {
    const carId = rental.Ma_xe;
    this.router.navigate(['/xe', carId]);
  }

  // Mở modal đánh giá
  openReviewModal(rental: RentalWithCar): void {
    this.selectedRental = rental;
    this.showReviewModal = true;
  }

  // Xử lý submit đánh giá từ modal component
  handleReviewSubmit(event: { rating: number; comment: string }): void {
    if (!this.selectedRental) return;
    
    // TODO: Gọi API lưu đánh giá
    console.log('Đánh giá:', {
      rental: this.selectedRental.Ma_don_thue,
      car: this.selectedRental.Ma_xe,
      rating: event.rating,
      comment: event.comment
    });

    alert(`Cảm ơn bạn đã đánh giá ${event.rating} sao!`);
    this.showReviewModal = false;
    this.selectedRental = null;
  }

  // Mở modal khiếu nại
  openComplaintModal(rental: RentalWithCar): void {
    this.selectedRental = rental;
    this.showComplaintModal = true;
  }

  // Xử lý submit khiếu nại từ modal component
  handleComplaintSubmit(event: { reason: string; description: string }): void {
    if (!this.selectedRental) return;
    
    // TODO: Gọi API lưu khiếu nại
    console.log('Khiếu nại:', {
      rental: this.selectedRental.Ma_don_thue,
      car: this.selectedRental.Ma_xe,
      reason: event.reason,
      description: event.description
    });

    alert('Khiếu nại của bạn đã được gửi. Chúng tôi sẽ xử lý trong thời gian sớm nhất!');
    this.showComplaintModal = false;
    this.selectedRental = null;
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