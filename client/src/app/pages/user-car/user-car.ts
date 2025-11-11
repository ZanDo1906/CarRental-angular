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
import { CalendarModalComponent } from '../../modals/calendar-modal/calendar-modal.component';
import { BlockDateModalComponent } from '../../modals/block-date-modal/block-date-modal.component';

// User car list for the first user
@Component({
  selector: 'app-user-car',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CalendarModalComponent, BlockDateModalComponent],
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
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
      // Scroll lên đầu trang khi chuyển trang
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      this.openEditModal(car);
    } else if (action === 'approve') {
      this.openCalendarModal(car);
    } else if (action === 'reject') {
      // Toggle trạng thái cho thuê
      const currentStatus = car.Tinh_trang_xe || 'active';
      const newStatus = currentStatus === 'active' ? 'stopped' : 'active';
      
      car.Tinh_trang_xe = newStatus;
      
      // Cập nhật trong danh sách
      const index = this.cars.findIndex(c => c.Ma_xe === car.Ma_xe);
      if (index !== -1) {
        this.cars[index] = { ...car };
      }
      
      // Lưu vào localStorage
      this.saveCarToStorage(car);
      
      // Thông báo
      const message = newStatus === 'stopped' 
        ? `Đã dừng cho thuê xe: ${car.Hang_xe} ${car.Dong_xe}`
        : `Đã tiếp tục cho thuê xe: ${car.Hang_xe} ${car.Dong_xe}`;
      alert(message);
      
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
}