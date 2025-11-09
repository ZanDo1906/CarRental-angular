import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../services/car';
import { LocationService } from '../../services/location';
import { BookingDataService } from '../../services/booking-data';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { ReviewService } from '../../services/review';
import { CarRental } from '../../services/car-rental';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  // CHỈ để các module/directive thực sự cần render
  imports: [CommonModule, FormsModule],
  templateUrl: './car-detail.html',
  styleUrl: './car-detail.css',
})
export class CarDetail implements OnInit, OnDestroy {
  id!: string | null;
  car: any;
  locations: any[] = [];
  carOwner: any = null; // Thông tin chủ xe
  carReviews: any[] = []; // Danh sách đánh giá
  carRentals: any[] = []; // Danh sách thuê xe
  allUsers: any[] = []; // Danh sách tất cả users để map reviewer
  ownerTripCount: number = 0; // Tổng số chuyến của chủ xe
  
  // Lightbox
  showLightbox = false;
  currentImageIndex = 0;

  // Favorite
  isFavorite = false;

  // Discount code
  discountCode: string = '';
  discountAmount: number = 0;

  // Pickup option
  pickupOption: string = 'atLocation';
  deliveryAddress: string = '';

  // Booking times
  pickupTime: string = '';
  returnTime: string = '';
  dateError: string = '';

  // Popup
  showErrorPopup: boolean = false;
  errorMessage: string = '';
  showLoginConfirm: boolean = false;
  justLoggedIn: boolean = false; // Flag để track đăng nhập mới

  constructor(
    private route: ActivatedRoute,
    private carService: CarService,
    private locationService: LocationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private bookingDataService: BookingDataService,
    private authService: AuthService,
    private userService: UserService,
    private reviewService: ReviewService,
    private carRentalService: CarRental
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    console.log('CarDetail ngOnInit - ID:', this.id);

    // Lắng nghe sự kiện đăng nhập thành công
    const loginHandler = this.handleLoginSuccess.bind(this);
    window.addEventListener('userLoggedIn', loginHandler);
    console.log('Added userLoggedIn event listener');

    // Lấy dữ liệu booking từ service
    const bookingData = this.bookingDataService.getBookingData();
    if (bookingData.pickupTime) {
      this.pickupTime = bookingData.pickupTime;
  }
    if (bookingData.returnTime) {
      this.returnTime = bookingData.returnTime;
    }

    // load chi tiết xe theo id
    if (this.id) {
      this.carService.getAllCars().subscribe({
        next: (list) => {
          console.log('Received car list:', list);
          this.car = Array.isArray(list)
            ? list.find((x: any) => String(x.Ma_xe) === String(this.id))
            : null;
          console.log('Found car:', this.car);
          
          // Load thông tin chủ xe
          if (this.car?.Ma_nguoi_dung) {
            this.loadCarOwner(this.car.Ma_nguoi_dung);
            this.loadOwnerTripCount(this.car.Ma_nguoi_dung);
          }
          
          // Load car rentals first, which will then load reviews
          this.loadCarRentals();
          
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading cars:', err);
        }
      });
    }

    // load locations to resolve addresses
    this.locationService.getAllLocations().subscribe({ 
      next: (data: any) => {
        this.locations = Array.isArray(data) ? data : [];
        console.log('Loaded locations:', this.locations.length);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading locations:', err);
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup event listener
    window.removeEventListener('userLoggedIn', this.handleLoginSuccess.bind(this));
  }

  // Tính tổng số chuyến của chủ xe từ Car.json
  loadOwnerTripCount(ownerId: number): void {
    this.carService.getAllCars().subscribe({
      next: (cars: any[]) => {
        const carList = Array.isArray(cars) ? cars : [];
        this.ownerTripCount = carList
          .filter(car => String(car.Ma_nguoi_dung) === String(ownerId))
          .reduce((sum, car) => sum + (car.So_luot_thue || 0), 0);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading cars for owner trip count:', err);
      }
    });
  }

  handleLoginSuccess(): void {
    console.log('handleLoginSuccess called in car-detail');
    // User đã đăng nhập, đóng popup và set flag
    this.showLoginConfirm = false;
    this.justLoggedIn = true; // Set flag để bỏ qua kiểm tra isAuthenticated
    setTimeout(() => {
      console.log('Calling proceedToBooking after login');
      this.proceedToBooking();
    }, 300);
  }

  // Lightbox functions
  openLightbox(index: number) {
    this.currentImageIndex = index;
    this.showLightbox = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.showLightbox = false;
    document.body.style.overflow = 'auto';
  }

  nextImage(event: Event) {
    event.stopPropagation();
    if (this.car?.Anh_xe?.length) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.car.Anh_xe.length;
    }
  }

  prevImage(event: Event) {
    event.stopPropagation();
    if (this.car?.Anh_xe?.length) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.car.Anh_xe.length) % this.car.Anh_xe.length;
    }
  }

  vnd(n: number | string | undefined) {
    if (n == null) return '';
    const x = typeof n === 'number' ? n : Number(n);
    return x.toLocaleString('vi-VN');
  }

  getLocationById(id: number): any {
    return this.locations?.find((loc: any) => loc.Ma_vi_tri == id);
  }

  getLocationAddress(id: number): string {
    const location = this.getLocationById(id);
    if (location) {
      return `${location.Dia_chi_cu_the || ''}${location.Phuong_xa ? ', ' + location.Phuong_xa : ''}${location.Quan_huyen ? ', ' + location.Quan_huyen : ''}${location.Tinh_thanh ? ', ' + location.Tinh_thanh : ''}`;
    }
    return 'Chưa cập nhật';
  }

  getLocationCity(): string {
    if (!this.car?.Ma_vi_tri) return '';
    const location = this.getLocationById(this.car.Ma_vi_tri);
    if (location) {
      return `${location.Dia_chi_cu_the}, ${location.Phuong_xa}, ${location.Quan_huyen}, ${location.Tinh_thanh}`;
    }
    return 'Chưa cập nhật';
  }

  getCarStatus(): { label: string; class: string } {
    if (!this.car?.Bao_hanh_gan_nhat) {
      return { label: 'Chưa có thông tin', class: 'status-unknown' };
    }

    const maintenanceDate = new Date(this.car.Bao_hanh_gan_nhat);
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

  getOwnerName(): string {
    return this.car?.Ten_chu_xe || 'Chủ xe';
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }

  shareLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Đã sao chép liên kết!');
    }).catch(() => {
      alert('Không thể sao chép liên kết. Vui lòng thử lại.');
    });
  }

  goBack() { this.router.navigate(['/']); }

  contactOwner() {
    // placeholder: implement contact flow
    alert('Liên hệ chủ xe (chức năng chưa triển khai)');
  }

  // Tính số ngày và giờ thuê
  calculateRentalDuration(): { days: number; hours: number; totalDays: number } {
    if (!this.pickupTime || !this.returnTime) {
      return { days: 1, hours: 0, totalDays: 1 }; // Default 1 ngày
    }

    const pickup = new Date(this.pickupTime);
    const returnDate = new Date(this.returnTime);
    const diffMs = returnDate.getTime() - pickup.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60)); // Làm tròn lên

    const fullDays = Math.floor(diffHours / 24);
    const extraHours = diffHours % 24;

    let totalDays = fullDays;
    
    // Áp dụng quy tắc tính giờ lẻ
    if (extraHours > 0) {
      if (extraHours <= 4) {
        // ≤ 4 tiếng: giữ nguyên số ngày, tính thêm giờ lẻ
        totalDays = fullDays;
      } else {
        // > 4 tiếng: tự động tính thành thêm 1 ngày
        totalDays = fullDays + 1;
      }
    }

    // Tối thiểu 1 ngày
    if (totalDays < 1) totalDays = 1;

    return { 
      days: fullDays, 
      hours: extraHours, 
      totalDays: totalDays 
    };
  }

  // Tính tổng tiền trước giảm giá
  getTotalBeforeDiscount(): number {
    const dailyRate = this.car?.Gia_thue || 0;
    const dailyInsuranceRate = 50000; // Bảo hiểm thuê xe hàng ngày
    const duration = this.calculateRentalDuration();

    let rentalCost = 0;
    let insuranceCost = 0;

    // Nếu thuê dưới 1 ngày (chỉ có giờ lẻ), tính tối thiểu 1 ngày
    if (duration.days === 0 && duration.hours > 0) {
      rentalCost = dailyRate * 1; // Tối thiểu 1 ngày
      insuranceCost = dailyInsuranceRate * 1; // Tối thiểu 1 ngày
    } else if (duration.hours > 0 && duration.hours <= 4 && duration.days > 0) {
      // Có giờ lẻ ≤ 4 tiếng và đã có ngày đầy đủ: tính theo tỷ lệ
      const dailyRentalCost = dailyRate * duration.days;
      const hourlyRentalCost = (dailyRate / 24) * duration.hours;
      rentalCost = dailyRentalCost + hourlyRentalCost;

      const dailyInsuranceCost = dailyInsuranceRate * duration.days;
      const hourlyInsuranceCost = (dailyInsuranceRate / 24) * duration.hours;
      insuranceCost = dailyInsuranceCost + hourlyInsuranceCost;
    } else {
      // Không có giờ lẻ hoặc > 4 tiếng: tính theo totalDays
      rentalCost = dailyRate * duration.totalDays;
      insuranceCost = dailyInsuranceRate * duration.totalDays;
    }

    return Math.round(rentalCost + insuranceCost);
  }

  // Tính thuế VAT (8% của Tổng tiền - Giảm giá)
  getVAT(): number {
    const afterDiscount = this.getTotalBeforeDiscount() - this.discountAmount;
    return Math.round(afterDiscount * 0.08);
  }

  // Tính thành tiền cuối cùng
  getFinalTotal(): number {
    return this.getTotalBeforeDiscount() - this.discountAmount + this.getVAT();
  }

  // Lấy mô tả thời gian thuê
  getRentalDurationDescription(): string {
    const duration = this.calculateRentalDuration();
    
    if (duration.days === 0 && duration.hours > 0) {
      return `${duration.hours} giờ (tính 1 ngày)`;
    } else if (duration.days > 0 && duration.hours === 0) {
      return `${duration.days} ngày`;
    } else if (duration.days > 0 && duration.hours > 0) {
      if (duration.hours <= 4) {
        return `${duration.days} ngày ${duration.hours} giờ`;
      } else {
        return `${duration.days} ngày ${duration.hours} giờ (tính ${duration.totalDays} ngày)`;
      }
    }
    
    return '1 ngày';
  }

  // Validate thời gian thuê/trả
  validateDates(): void {
    this.dateError = '';
    if (this.pickupTime && this.returnTime) {
      const pickup = new Date(this.pickupTime);
      const returnDate = new Date(this.returnTime);
      
      if (returnDate <= pickup) {
        this.dateError = 'Thời gian trả phải sau thời gian nhận';
        this.returnTime = '';
      }
    }
  }

  // Xử lý khi bấm nút "Thuê xe"
  proceedToBooking(): void {
    console.log('proceedToBooking called');
    console.log('justLoggedIn:', this.justLoggedIn);
    
    // Kiểm tra localStorage trực tiếp thay vì dùng AuthService
    const currentUser = localStorage.getItem('currentUser');
    const isLoggedIn = !!currentUser;
    console.log('isLoggedIn (from localStorage):', isLoggedIn);
    
    // Kiểm tra đã đăng nhập chưa
    if (!isLoggedIn) {
      console.log('Not authenticated, showing login popup');
      this.showLoginConfirm = true;
      return;
    }

    console.log('User authenticated, checking required fields');
    console.log('pickupTime:', this.pickupTime);
    console.log('returnTime:', this.returnTime);
    console.log('pickupOption:', this.pickupOption);
    console.log('deliveryAddress:', this.deliveryAddress);

    // Đã đăng nhập, kiểm tra các trường bắt buộc
    const errors: string[] = [];
    if (!this.pickupTime) {
      errors.push('- Thời gian nhận xe');
    }
    if (!this.returnTime) {
      errors.push('- Thời gian trả xe');
    }
    if (this.pickupOption === 'delivery' && !this.deliveryAddress) {
      errors.push('- Địa chỉ giao xe');
    }

    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin:\n' + errors.join('\n');
      this.showErrorPopup = true;
      return;
    }

    // Nếu có lỗi về ngày tháng
    if (this.dateError) {
      console.log('Date error:', this.dateError);
      this.errorMessage = this.dateError;
      this.showErrorPopup = true;
      return;
    }

    console.log('All validations passed, navigating to confirm-booking');
    // Lưu dữ liệu booking và chuyển sang confirm-booking  
    this.bookingDataService.setBookingData({
      location: this.getLocationCity(),
      pickupTime: this.pickupTime,
      returnTime: this.returnTime,
      pickupOption: this.pickupOption,
      deliveryAddress: this.deliveryAddress,
      carInfo: {
        id: this.car.Ma_xe,
        name: (this.car.Hang_xe || '') + ' ' + (this.car.Dong_xe || '') + ' ' + (this.car.Nam_san_xuat || ''),
        price: this.car.Gia_thue,
        seats: (this.car.So_cho || 0) + ' chỗ',
        fuel: this.car.Nhien_lieu,
        transmission: this.car.Hop_so,
        fuelConsumption: (this.car.Muc_tieu_thu || 0) + 'L/100km',
        images: this.car.Anh_xe
      },
      paymentInfo: {
        subtotal: this.getTotalBeforeDiscount(),
        discount: this.discountAmount,
        vat: this.getVAT(),
        total: this.getFinalTotal()
      }
    });
    this.router.navigate(['/confirm-booking', this.car.Ma_xe]);
  }

  // Đóng popup lỗi
  closeErrorPopup(): void {
    this.showErrorPopup = false;
    this.errorMessage = '';
  }

  // Xử lý khi user muốn đăng nhập
  goToLogin(): void {
    this.showLoginConfirm = false;
    // Trigger Bootstrap modal đăng nhập từ header
    const loginModalElement = document.getElementById('loginModal');
    if (loginModalElement) {
      const bootstrap = (window as any).bootstrap;
      if (bootstrap && bootstrap.Modal) {
        const loginModal = new bootstrap.Modal(loginModalElement);
        loginModal.show();
      }
    }
  }

  // Đóng popup confirm login
  closeLoginConfirm(): void {
    this.showLoginConfirm = false;
  }

  // Load thông tin chủ xe từ User.json
  loadCarOwner(userId: string): void {
    this.userService.getAllUsers().subscribe({
      next: (users: any) => {
        const userList = Array.isArray(users) ? users : [];
        this.allUsers = userList; // Store for reviewer lookup
        this.carOwner = userList.find((u: any) => String(u.Ma_nguoi_dung) === String(userId));
        console.log('Loaded car owner:', this.carOwner);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading car owner:', err);
      }
    });
  }

  // Load reviews cho xe này
  loadCarReviews(): void {
    this.reviewService.getAllReviews().subscribe({
      next: (reviews: any) => {
        const reviewList = Array.isArray(reviews) ? reviews : [];
        // Filter reviews by matching Ma_don_thue with carRentals
        this.carReviews = reviewList.filter((r: any) => 
          this.carRentals.some((rental: any) => String(rental.Ma_don_thue) === String(r.Ma_don_thue))
        );
        console.log('Loaded car reviews:', this.carReviews.length);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
      }
    });
  }

  // Load car rentals cho xe này để tính số chuyến
  loadCarRentals(): void {
    this.carRentalService.getAllCars().subscribe({
      next: (rentals: any) => {
        const rentalList = Array.isArray(rentals) ? rentals : [];
        this.carRentals = rentalList.filter((r: any) => String(r.Ma_xe) === String(this.id));
        console.log('Loaded car rentals:', this.carRentals.length);
        
        // Load reviews after rentals are loaded
        this.loadCarReviews();
        
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading car rentals:', err);
      }
    });
  }

  // Lấy tên người đánh giá
  getReviewerName(review: any): string {
    // Find rental by Ma_don_thue
    const rental = this.carRentals.find((r: any) => String(r.Ma_don_thue) === String(review.Ma_don_thue));
    if (!rental) return 'Người dùng';
    
    // Find user by Ma_nguoi_thue
    const user = this.allUsers.find((u: any) => String(u.Ma_nguoi_dung) === String(rental.Ma_nguoi_thue));
    return user?.Ho_va_ten || 'Người dùng';
  }

  // Lấy avatar người đánh giá
  getReviewerAvatar(review: any): string {
    // Find rental by Ma_don_thue
    const rental = this.carRentals.find((r: any) => String(r.Ma_don_thue) === String(review.Ma_don_thue));
    if (!rental) return 'assets/images/default-avatar.png';
    
    // Find user by Ma_nguoi_thue
    const user = this.allUsers.find((u: any) => String(u.Ma_nguoi_dung) === String(rental.Ma_nguoi_thue));
    return user?.Anh_dai_dien || 'assets/images/default-avatar.png';
  }
}

