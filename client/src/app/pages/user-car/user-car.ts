import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CarService } from '../../services/car';
import { LocationService } from '../../services/location';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';
import { CarRental } from '../../services/car-rental';
import { Inject } from '@angular/core';
import { OwnerService } from '../../services/owner.service';
import { BlockedDateService } from '../../services/blocked-date.service';
import { BlockedDate } from '../../interfaces/BlockedDate';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CalendarModalComponent } from '../../components/modals/calendar-modal/calendar-modal.component';
import { BlockDateModalComponent } from '../../components/modals/block-date-modal/block-date-modal.component';
import { CarEditModalComponent } from '../../components/modals/car-edit-modal/car-edit-modal.component';
import { ComplaintModalComponent } from '../../components/modals/complaint-modal/complaint-modal.component';

// User car list for the first user
@Component({
  selector: 'app-user-car',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CalendarModalComponent, BlockDateModalComponent, CarEditModalComponent, ComplaintModalComponent],
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

  // Filter properties
  selectedCarFilter: string = 'all';
  selectedTripFilter: string = 'renting';
  filteredCars: any[] = [];
  
  // Dropdown state
  openDropdown: string | null = null;
  
  // Rental section properties
  showRentalSection: boolean = false;
  filteredRentals: any[] = [];

  // Modal variables
  showModal = false;
  editingCar: any = null;
  originalCar: any = null;

  // Calendar modal variables
  showCalendarModal = false;
  selectedCar: any = null;
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  calendarDays: any[] = [];
  rentals: any[] = [];
  occupiedDates: Set<string> = new Set();
  blockedDates: BlockedDate[] = [];
  blockedDateSet: Set<string> = new Set();
  
  // Block date modal variables
  showBlockModal = false;
  blockStartDate: string = '';
  blockEndDate: string = '';
  blockReason: string = '';
  selectedDateForBlock: any = null;

  ownerId: number | null = null;
  private subscriptions: Subscription[] = [];
  currentUserRole: string | null = null; // Lưu role của user hiện tại
  isRenterRole: boolean = false; // true nếu là người thuê (role = "1")

  constructor(
    private carService: CarService,
    private locationService: LocationService,
    private userService: UserService,
    private authService: AuthService,
    private carRentalService: CarRental,
    private blockedDateService: BlockedDateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(OwnerService) private ownerService: OwnerService
  ) {}
   vnd(n: number | string | undefined) {
  if (n == null) return '';
  const x = typeof n === 'number' ? n : Number(n);
  return x.toLocaleString('vi-VN');   // chỉ số, KHÔNG kèm đơn vị
  }

  // Format price with thousand separators
  formatPrice(event: any) {
    const value = event.target.value.replace(/[^\d]/g, '');
    this.editingCar.Gia_thue = Number(value);
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
    
    // Initialize calendar for current month
    this.generateCalendar();
    
    // Add click event listener để đóng dropdown khi click bên ngoài
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  private handleDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    // Nếu click không phải trên dropdown wrapper thì đóng tất cả dropdown
    if (!target.closest('.dropdown-wrapper')) {
      this.closeAllDropdowns();
    }
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
    
    // Remove event listener
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  private initializeData() {
    // Lấy user hiện tại từ AuthService
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser) {
      this.ownerId = currentUser.Ma_nguoi_dung;
      this.currentUserRole = currentUser.Vai_tro || null;
      // Kiểm tra nếu là người thuê (role = "1")
      this.isRenterRole = this.currentUserRole === "1";
      
      // Chỉ load data nếu là người cho thuê (role = "2")
      if (!this.isRenterRole) {
        this.loadUserData();
      } else {
        // Nếu là người thuê, không cần load data
        this.loading = false;
        this.cdr.detectChanges();
      }
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
      console.log('Raw data from JSON:', all.slice(0, 3)); // Debug: first 3 cars
      const merged = this.mergeExtras(all);
      console.log('Merged data (after localStorage):', merged.slice(0, 3)); // Debug: first 3 cars
      
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

      console.log('Final cars data:', this.cars.slice(0, 2)); // Debug: first 2 user cars
      this.cars.forEach(car => {
        console.log(`Car ${car.Ma_xe}: Tinh_trang_xe = "${car.Tinh_trang_xe}"`);
      });

      // Ensure pagination resets when owner changes
      this.currentPage = 1;
      this.loading = false;

      // Apply filters after loading data
      this.applyFilters();

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
      let selectedUser = null;
      
      if (currentUserId) {
        selectedUser = list.find(u => Number(u.Ma_nguoi_dung) === Number(currentUserId));
        if (selectedUser) {
          this.ownerId = Number(currentUserId);
        }
      }
      
      if (!selectedUser && list.length > 0) {
        selectedUser = list[0];
        this.ownerId = Number(selectedUser.Ma_nguoi_dung);
        try { this.ownerService.setOwnerId(this.ownerId); } catch (e) {}
      }
      
      // Kiểm tra role từ selectedUser
      if (selectedUser) {
        this.currentUserRole = selectedUser.Vai_tro || null;
        this.isRenterRole = this.currentUserRole === "1";
        
        // Chỉ load data nếu là người cho thuê (role = "2")
        if (!this.isRenterRole) {
          this.loadUserData();
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      } else {
        this.loadUserData();
      }
    });
  }

  // Pagination helpers used by the template
  displayedCars(): any[] {
    // keep the name displayedUsers() for template compatibility but return cars
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCars.slice(start, start + this.pageSize);
  }

  users(): any[] {
    // return full list for header count (template used users())
    return this.filteredCars;
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCars.length / this.pageSize));
  }

  totalPagesArray(): number[] {
    const n = this.totalPages();
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
      // Scroll lên đầu trang khi chuyển trang
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void { this.goToPage(this.currentPage + 1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }

  // Filter methods  
  setCarFilter(filter: string): void {
    this.selectedCarFilter = filter;
    
    // Apply filter to show cars
    this.applyFilters();
    this.currentPage = 1;
    
    // Ensure rental section is hidden
    this.showRentalSection = false;
  }

  setTripFilter(filter: string): void {
    this.selectedTripFilter = filter;
    
    // Load and filter rental data based on selected filter
    this.showRentalSection = true;
    this.loadRentalsByFilter(filter);
  }

  // Dropdown methods
  toggleDropdown(key: string): void {
    this.openDropdown = this.openDropdown === key ? null : key;
  }

  selectCarFilter(filter: string): void {
    this.setCarFilter(filter);
    this.openDropdown = null;
  }

  selectTripFilter(filter: string): void {
    this.setTripFilter(filter);
    this.openDropdown = null;
  }

  // Load rentals based on filter
  loadRentalsByFilter(filter: string): void {
    this.carRentalService.getAllCars().subscribe((allRentals: any[]) => {
      // Filter rentals for current user's cars
      const userCarIds = this.cars.map(car => car.Ma_xe);
      let userRentals = allRentals.filter(rental => 
        userCarIds.includes(Number(rental.Ma_xe))
      );

      // Apply status filter
      switch(filter) {
        case 'renting':
          // Đang cho thuê: status 1 (pending), 2 (approved) và 3 (renting)
          this.filteredRentals = userRentals.filter(rental => 
            rental.Trang_thai === 1 || rental.Trang_thai === 2 || rental.Trang_thai === 3
          );
          break;
        case 'completed':
          // Đã hoàn tất: status 4 (completed)
          this.filteredRentals = userRentals.filter(rental => 
            rental.Trang_thai === 4
          );
          break;
        case 'cancelled':
          // Đã hủy: status 0 (cancelled) và 5 (rejected)
          this.filteredRentals = userRentals.filter(rental => 
            rental.Trang_thai === 0 || rental.Trang_thai === 5
          );
          break;
        default:
          this.filteredRentals = userRentals;
      }

      // Sort by date (newest first)
      this.filteredRentals.sort((a, b) => 
        new Date(b.Ngay_tao || b.Ngay_nhan_xe).getTime() - 
        new Date(a.Ngay_tao || a.Ngay_nhan_xe).getTime()
      );

      this.cdr.detectChanges();
    });
  }

  // Handle select changes
  onCarFilterChange(event: any): void {
    const filter = event.target.value;
    this.setCarFilter(filter);
  }

  onTripFilterChange(event: any): void {
    const filter = event.target.value;
    this.setTripFilter(filter);
  }

  // Close dropdowns when clicking outside (keep for other modals)
  private closeAllDropdowns(): void {
    // No longer needed for select dropdowns
  }

  getCarFilterText(): string {
    const filterMap: { [key: string]: string } = {
      'all': 'Tất cả',
      'active': 'Đang hoạt động',
      'stopped': 'Dừng hoạt động',
      'pending': 'Chờ duyệt',
      'rejected': 'Bị từ chối'
    };
    return filterMap[this.selectedCarFilter] || 'Tất cả';
  }

  getTripFilterText(): string {
    const filterMap: { [key: string]: string } = {
      'renting': 'Đang cho thuê',
      'completed': 'Đã hoàn tất',
      'cancelled': 'Đã hủy'
    };
    return filterMap[this.selectedTripFilter] || 'Đang cho thuê';
  }

  applyFilters(): void {
    let filtered = [...this.cars];

    // Apply car status filter
    if (this.selectedCarFilter !== 'all') {
      filtered = filtered.filter(car => {
        const status = car.Tinh_trang_xe || car.Trang_thai || 'Sẵn sàng cho thuê';
        switch (this.selectedCarFilter) {
          case 'active':
            return status === 'active' || status === 'approved' || status === 'Sẵn sàng cho thuê' || status === 1 || status === 2;
          case 'stopped':
            return status === 'stopped' || status === 'inactive' || status === 'Đã dừng cho thuê';
          case 'pending':
            return status === 'pending' || status === 'Đang chờ duyệt' || status === 0;
          case 'rejected':
            return status === 'rejected' || status === 'Từ chối duyệt' || status === -1 || status === 5;
          default:
            return true;
        }
      });
    }

    // For trip filter, we would need rental data to filter cars based on their rental status
    // This is a placeholder - you might want to load rental data and filter accordingly
    if (this.selectedTripFilter !== 'renting') {
      // Load rental data and filter cars based on their current rental status
      // This would require integration with car rental service
    }

    this.filteredCars = filtered;
    this.cdr.detectChanges();
  }

  // Hide rental section
  hideRentalSection(): void {
    this.showRentalSection = false;
    this.filteredRentals = [];
  }

  // Get car name by ID
  getCarName(carId: number): string {
    const car = this.cars.find(c => Number(c.Ma_xe) === Number(carId));
    return car ? `${car.Hang_xe} ${car.Dong_xe} ${car.Nam_san_xuat}` : `Xe #${carId}`;
  }

  // Get user name by ID
  getUserName(userId: number): string {
    // You might want to load user data or use a service here
    return `Khách hàng #${userId}`;
  }

  // Get rental status text
  getRentalStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'Đã hủy',
      1: 'Chờ duyệt',
      2: 'Đã duyệt',
      3: 'Đang thuê',
      4: 'Hoàn thành',
      5: 'Bị từ chối'
    };
    return statusMap[status] || 'Không xác định';
  }

  // Get rental status CSS class
  getRentalStatusClass(status: number): string {
    const classMap: { [key: number]: string } = {
      0: 'status-cancelled',
      1: 'status-pending',
      2: 'status-approved',
      3: 'status-active',
      4: 'status-completed',
      5: 'status-rejected'
    };
    return classMap[status] || 'status-unknown';
  }

  // Format date for display
  formatRentalDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // View rental detail
  viewRentalDetail(rental: any): void {
    // You can implement a modal or navigate to detail page
    alert(`Chi tiết chuyến thuê:\nMã: ${rental.Ma_chuyen_di}\nTrạng thái: ${this.getRentalStatusText(rental.Trang_thai)}`);
  }

  getLocationAddress(id: number): string {
    if (!this.locations || !this.locations.length) return 'Chưa cập nhật';
    const l = this.locations.find((x: any) => x.Ma_vi_tri == id || x.Ma_vi_tri === String(id));
    if (!l) return 'Chưa cập nhật';
    return `${l.Dia_chi_cu_the || ''}${l.Phuong_xa ? ', ' + l.Phuong_xa : ''}${l.Quan_huyen ? ', ' + l.Quan_huyen : ''}${l.Tinh_thanh ? ', ' + l.Tinh_thanh : ''}`;
  }

  onAction(action: string, car: any) {
    if (action === 'view') {
      this.openEditModal(car);
    } else if (action === 'approve') {
      this.openCalendarModal(car);
    } else if (action === 'reject') {
      // Toggle trạng thái cho thuê
      const currentStatus = car.Tinh_trang_xe || 'active';
      let newStatus: string;
      
      // Xử lý cả trạng thái tiếng Việt và tiếng Anh
      if (currentStatus === 'active' || currentStatus === 'Sẵn sàng cho thuê') {
        newStatus = 'Dừng cho thuê';
      } else {
        newStatus = 'Đang cho thuê';
      }
      
      car.Tinh_trang_xe = newStatus;
      
      // Cập nhật trong danh sách
      const index = this.cars.findIndex(c => c.Ma_xe === car.Ma_xe);
      if (index !== -1) {
        this.cars[index] = { ...car };
      }
      
      // Lưu vào localStorage
      this.saveCarToStorage(car);
      
      // Thông báo
      const message = newStatus === 'Đã dừng cho thuê' 
        ? `Đã dừng cho thuê xe: ${car.Hang_xe} ${car.Dong_xe}`
        : `Đã tiếp tục cho thuê xe: ${car.Hang_xe} ${car.Dong_xe}`;
      alert(message);
      
      // Refresh UI
      this.cdr.detectChanges();
    } else if (action === 'resubmit') {
      // Gửi lại duyệt xe bị từ chối
      car.Tinh_trang_xe = 'Đang chờ duyệt';
      
      // Cập nhật trong danh sách
      const index = this.cars.findIndex(c => c.Ma_xe === car.Ma_xe);
      if (index !== -1) {
        this.cars[index] = { ...car };
      }
      
      // Lưu vào localStorage
      this.saveCarToStorage(car);
      
      alert(`Đã gửi lại xe ${car.Hang_xe} ${car.Dong_xe} để admin duyệt!`);
      
      // Refresh UI
      this.cdr.detectChanges();
    }
  }

  // Modal methods
  openEditModal(car: any) {
    this.originalCar = { ...car };
    this.editingCar = { ...car };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingCar = null;
    this.originalCar = null;
  }

  saveCar() {
    if (!this.editingCar) return;

    // Validation chỉ cho các trường có thể chỉnh sửa
    if (!this.editingCar.Gia_thue || this.editingCar.Gia_thue < 50000) {
      alert('Giá thuê phải từ 50,000 VNĐ trở lên');
      return;
    }

    if (this.editingCar.Gia_thue > 10000000) {
      alert('Giá thuê không được vượt quá 10,000,000 VNĐ');
      return;
    }

    if (this.editingCar.So_km && (this.editingCar.So_km < 0 || this.editingCar.So_km > 999999)) {
      alert('Số km không hợp lệ (0 - 999,999 km)');
      return;
    }

    if (this.editingCar.Muc_tieu_thu && (this.editingCar.Muc_tieu_thu < 0 || this.editingCar.Muc_tieu_thu > 50)) {
      alert('Mức tiêu thụ không hợp lệ (0 - 50 L/100km)');
      return;
    }

    // Validate hình ảnh (ít nhất 1 ảnh)
    if (!this.editingCar.Anh_xe || this.editingCar.Anh_xe.length === 0) {
      alert('Xe phải có ít nhất 1 hình ảnh');
      return;
    }

    // Cập nhật trong danh sách cars
    const index = this.cars.findIndex(c => c.Ma_xe === this.editingCar.Ma_xe);
    if (index !== -1) {
      this.cars[index] = { ...this.editingCar };
    }

    // Lưu vào localStorage (extraCars)
    this.saveCarToStorage(this.editingCar);
    
    // Đóng modal
    this.closeModal();
    
    // Refresh UI
    this.cdr.detectChanges();
    
    alert('Thông tin xe đã được cập nhật thành công!');
  }

  cancelEdit() {
    if (this.originalCar) {
      this.editingCar = { ...this.originalCar };
    }
    this.closeModal();
  }

  private saveCarToStorage(car: any) {
    const key = 'extraCars';
    try {
      const raw = localStorage.getItem(key);
      const extras = raw ? JSON.parse(raw) : [];
      
      const existingIndex = extras.findIndex((x: any) => Number(x.Ma_xe) === Number(car.Ma_xe));
      
      if (existingIndex >= 0) {
        extras[existingIndex] = car;
      } else {
        extras.push(car);
      }
      
      localStorage.setItem(key, JSON.stringify(extras));
    } catch (e) {
      console.error('Error saving car to storage:', e);
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

  // Xử lý chọn hình ảnh mới
  onImageSelected(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Kiểm tra số lượng ảnh hiện tại + ảnh mới
    const currentImageCount = this.editingCar.Anh_xe ? this.editingCar.Anh_xe.length : 0;
    const maxImages = 10; // Giới hạn tối đa 10 ảnh

    if (currentImageCount + files.length > maxImages) {
      alert(`Chỉ có thể tải lên tối đa ${maxImages} hình ảnh. Hiện tại có ${currentImageCount} ảnh.`);
      return;
    }

    // Xử lý từng file
    Array.from(files).forEach((file: any) => {
      // Kiểm tra định dạng file
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} không phải là hình ảnh hợp lệ.`);
        return;
      }

      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} quá lớn. Kích thước tối đa là 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (!this.editingCar.Anh_xe) {
          this.editingCar.Anh_xe = [];
        }
        this.editingCar.Anh_xe.push(e.target.result);
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    });

    // Reset input file để có thể chọn lại cùng file nếu cần
    event.target.value = '';
  }

  // Xóa hình ảnh
  removeImage(index: number) {
    if (!this.editingCar.Anh_xe || index < 0 || index >= this.editingCar.Anh_xe.length) return;

    const confirmDelete = confirm('Bạn có chắc chắn muốn xóa hình ảnh này?');
    if (confirmDelete) {
      this.editingCar.Anh_xe.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  // ========== CALENDAR METHODS ==========

  // Mở modal lịch cho thuê
  openCalendarModal(car: any) {
    this.selectedCar = car;
    this.showCalendarModal = true;
    this.loadRentalData();
  }

  // Đóng modal lịch
  closeCalendarModal() {
    this.showCalendarModal = false;
    this.selectedCar = null;
    this.occupiedDates.clear();
  }

  // Mở trang đăng ký xe mới
  openRegisterCarModal() {
    // Điều hướng đến trang "Đăng ký cho thuê xe"
    this.router.navigate(['/dk-cho-thue-xe']).then(success => {
      if (!success) {
        console.error('Không thể điều hướng đến trang đăng ký xe');
      }
    });
  }

  // Load dữ liệu thuê xe và ngày bị chặn
  loadRentalData() {
    if (!this.selectedCar) return;

    // Load rental data
    this.carRentalService.getAllCars().subscribe((rentals: any[]) => {
      // Lọc các đơn thuê cho xe hiện tại
      const carRentals = rentals.filter(r => 
        Number(r.Ma_xe) === Number(this.selectedCar.Ma_xe) &&
        r.Trang_thai !== 0 && r.Trang_thai !== 5 // Loại bỏ đơn đã hủy/từ chối
      );

      this.rentals = carRentals;
      this.calculateOccupiedDates();
      
      // Load blocked dates
      this.loadBlockedDates();
    });
  }

  // Load blocked dates cho xe hiện tại
  loadBlockedDates() {
    if (!this.selectedCar) return;

    this.blockedDateService.getBlockedDatesForCar(this.selectedCar.Ma_xe).subscribe(dates => {
      this.blockedDates = dates;
      this.calculateBlockedDates();
      this.generateCalendar();
    });
  }

  // Tính toán các ngày bị chặn
  calculateBlockedDates() {
    this.blockedDateSet.clear();

    this.blockedDates.forEach(blocked => {
      const startDate = new Date(blocked.Ngay_bat_dau);
      const endDate = new Date(blocked.Ngay_ket_thuc);

      // Thêm tất cả các ngày từ ngày bắt đầu đến ngày kết thúc
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = this.formatDate(d);
        this.blockedDateSet.add(dateStr);
      }
    });
  }

  // Tính toán các ngày đã được thuê
  calculateOccupiedDates() {
    this.occupiedDates.clear();

    this.rentals.forEach(rental => {
      const startDate = new Date(rental.Ngay_nhan_xe);
      const endDate = new Date(rental.Ngay_tra_xe);

      // Thêm tất cả các ngày từ ngày nhận đến ngày trả
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = this.formatDate(d);
        this.occupiedDates.add(dateStr);
      }
    });
  }

  // Format ngày theo định dạng YYYY-MM-DD
  formatDate(date: Date): string {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  }

  // Tạo lịch cho tháng hiện tại
  generateCalendar() {
    this.calendarDays = [];
    
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    
    // Tìm ngày thứ hai đầu tuần
    startDate.setDate(startDate.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));

    // Ngày hôm nay (chỉ ngày, không tính giờ)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tạo 6 tuần (42 ngày) để đảm bảo hiển thị đủ lịch
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateStr = this.formatDate(currentDate);
      const isCurrentMonth = currentDate.getMonth() === this.currentMonth;
      const isOccupied = this.occupiedDates.has(dateStr);
      const isBlocked = this.blockedDateSet.has(dateStr);
      const isToday = this.formatDate(today) === dateStr;
      
      // Kiểm tra ngày đã qua: chỉ những ngày TRƯỚC hôm nay
      const isPast = currentDate < today;
      
      // Ngày rảnh trong tương lai: không bị thuê, không bị block, không phải ngày quá khứ, trong tháng hiện tại
      const isFutureAvailable = isCurrentMonth && !isPast && !isOccupied && !isBlocked && !isToday;
      
      // Ngày có thể tương tác: hôm nay hoặc tương lai
      const isInteractable = !isPast || isOccupied || isBlocked;

      this.calendarDays.push({
        date: currentDate,
        dateStr: dateStr,
        day: currentDate.getDate(),
        isCurrentMonth: isCurrentMonth,
        isOccupied: isOccupied,
        isBlocked: isBlocked,
        isToday: isToday,
        isPast: isPast,
        isFutureAvailable: isFutureAvailable,
        isInteractable: isInteractable
      });
    }
  }

  // Chuyển tháng trước
  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  // Chuyển tháng sau
  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  // Lấy tên tháng
  getMonthName(): string {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return months[this.currentMonth];
  }

  // Lấy thông tin đơn thuê cho ngày cụ thể
  getRentalInfo(dateStr: string): string {
    const rentalsForDate = this.rentals.filter(rental => {
      const startDate = new Date(rental.Ngay_nhan_xe);
      const endDate = new Date(rental.Ngay_tra_xe);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate;
    });

    if (rentalsForDate.length > 0) {
      const rental = rentalsForDate[0];
      return `Thuê từ ${rental.Ngay_nhan_xe} đến ${rental.Ngay_tra_xe}`;
    }
    return '';
  }

  // Lấy trạng thái text
  getStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
      1: 'Chờ duyệt',
      2: 'Đã duyệt', 
      3: 'Đang thuê',
      4: 'Hoàn thành',
      5: 'Bị từ chối'
    };
    return statusMap[status] || 'Không xác định';
  }

  // Lấy trạng thái xe text
  getCarStatusText(status: string): string {
    console.log('getCarStatusText input:', status); // Debug log
    const statusMap: { [key: string]: string } = {
      // Mapping từ tiếng Anh (nếu có)
      'pending': 'Đang chờ duyệt',
      'active': 'Sẵn sàng cho thuê',
      'stopped': 'Dừng cho thuê',
      'rejected': 'Từ chối duyệt',
      // Mapping từ tiếng Việt (từ JSON)
      'Đang chờ duyệt': 'Đang chờ duyệt',
      'Sẵn sàng cho thuê': 'Đang cho thuê',
      'Đã dừng cho thuê': 'Dừng cho thuê',
      'Từ chối duyệt': 'Từ chối duyệt'
    };
    const result = statusMap[status] || 'Không xác định';
    console.log('getCarStatusText output:', result); // Debug log
    return result;
  }

  // Maintenance tag helpers (reuse same logic as car-detail)
  getMaintenanceStatus(car: any): { label: string; class: string } {
    if (!car || !car.Bao_hanh_gan_nhat) {
      return { label: '', class: 'status-unknown' };
    }

    const maintenanceDate = new Date(car.Bao_hanh_gan_nhat);
    if (isNaN(maintenanceDate.getTime())) {
      return { label: '', class: 'status-unknown' };
    }

    const today = new Date();
    const diffTime = today.getTime() - maintenanceDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 90) {
      return { label: 'Đã bảo dưỡng gần đây', class: 'status-good' };
    } else if (diffDays >= 90 && diffDays <= 180) {
      return { label: 'Sắp đến hạn bảo dưỡng', class: 'status-warning' };
    } else {
      return { label: 'Cần bảo dưỡng', class: 'status-danger' };
    }
  }

  getMaintenanceStatusLabel(car: any): string {
    return this.getMaintenanceStatus(car).label;
  }

  getMaintenanceStatusClass(car: any): string {
    return this.getMaintenanceStatus(car).class;
  }

  // Tính tổng doanh thu
  getTotalRevenue(): string {
    const total = this.rentals.reduce((sum, rental) => sum + (rental.Tong_chi_phi || 0), 0);
    return this.vnd(total);
  }

  // Lấy tooltip text cho ngày
  getTooltipText(day: any): string {
    if (!day.isCurrentMonth) return '';
    
    if (day.isOccupied) {
      return this.getRentalInfo(day.dateStr);
    }
    
    if (day.isBlocked) {
      const blockedInfo = this.getBlockedInfo(day.dateStr);
      return blockedInfo ? `Đã chặn: ${blockedInfo}` : 'Đã chặn bởi chủ xe';
    }
    
    if (day.isToday) {
      return 'Hôm nay' + (day.isOccupied ? '' : ' - Có thể thuê');
    }
    
    if (day.isPast) {
      return 'Ngày đã qua';
    }
    
    if (day.isFutureAvailable) {
      return 'Ngày rảnh - Click để chặn';
    }
    
    return '';
  }

  // Lấy thông tin blocked date
  getBlockedInfo(dateStr: string): string {
    const blocked = this.blockedDates.find(b => {
      const startDate = new Date(b.Ngay_bat_dau);
      const endDate = new Date(b.Ngay_ket_thuc);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate;
    });

    if (blocked) {
      return blocked.Ly_do || `${blocked.Ngay_bat_dau} - ${blocked.Ngay_ket_thuc}`;
    }
    return '';
  }

  // Click vào ngày để block
  onDayClick(day: any) {
    if (!day.isFutureAvailable) return;
    
    this.selectedDateForBlock = day;
    this.blockStartDate = day.dateStr;
    this.blockEndDate = day.dateStr;
    this.blockReason = '';
    this.showBlockModal = true;
  }

  // Đóng modal block
  closeBlockModal() {
    this.showBlockModal = false;
    this.selectedDateForBlock = null;
    this.blockStartDate = '';
    this.blockEndDate = '';
    this.blockReason = '';
  }

  // Xác nhận block dates
  confirmBlockDates() {
    if (!this.selectedCar || !this.blockStartDate || !this.blockEndDate) return;

    const newBlock: BlockedDate = {
      Ma_xe: this.selectedCar.Ma_xe,
      Ngay_bat_dau: this.blockStartDate,
      Ngay_ket_thuc: this.blockEndDate,
      Ly_do: this.blockReason || 'Nhu cầu cá nhân',
      Ngay_tao: new Date().toISOString()
    };

    this.blockedDateService.addBlockedDate(newBlock).subscribe({
      next: (result) => {
        alert('Đã chặn ngày thành công!');
        this.closeBlockModal();
        this.loadBlockedDates();
      },
      error: (err) => {
        console.error('Error blocking dates:', err);
        alert('Có lỗi xảy ra khi chặn ngày!');
      }
    });
  }

  // Xóa blocked date
  removeBlockedDate(day: any) {
    if (!day.isBlocked) return;

    const blocked = this.blockedDates.find(b => {
      const startDate = new Date(b.Ngay_bat_dau);
      const endDate = new Date(b.Ngay_ket_thuc);
      const checkDate = new Date(day.dateStr);
      return checkDate >= startDate && checkDate <= endDate;
    });

    if (blocked && blocked.Ma_block) {
      if (confirm('Bạn có chắc muốn bỏ chặn khoảng thời gian này?')) {
        this.blockedDateService.removeBlockedDate(blocked.Ma_block).subscribe({
          next: () => {
            alert('Đã bỏ chặn thành công!');
            this.loadBlockedDates();
          },
          error: (err) => {
            console.error('Error removing block:', err);
            alert('Có lỗi xảy ra khi bỏ chặn!');
          }
        });
      }
    }
  }

  // Handle blocked date removal from calendar modal
  handleBlockedDateRemoval(blocked: BlockedDate) {
    if (blocked && blocked.Ma_block) {
      if (confirm('Bạn có chắc muốn bỏ chặn khoảng thời gian này?')) {
        this.blockedDateService.removeBlockedDate(blocked.Ma_block).subscribe({
          next: () => {
            alert('Đã bỏ chặn thành công!');
            // Calendar modal will reload its own data
          },
          error: (err) => {
            console.error('Error removing block:', err);
            alert('Có lỗi xảy ra khi bỏ chặn!');
          }
        });
      }
    }
  }

  // Complaint modal state
  showComplaintModal: boolean = false;
  selectedRental: any = null;

  // Open complaint modal
  openComplaintModal(rental: any): void {
    this.selectedRental = rental;
    this.showComplaintModal = true;
  }

  // Handle complaint submission from modal
  handleComplaintSubmit(payload: { reason: string; description: string }): void {
    // Here you should send payload + selectedRental to backend. For now, just show an alert and log.
    console.log('Complaint submitted for rental', this.selectedRental, payload);
    alert('Đã gửi khiếu nại. Chúng tôi sẽ xử lý trong thời gian sớm nhất.');
  }
}