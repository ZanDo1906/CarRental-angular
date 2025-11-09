import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';
import { iUser } from '../../interfaces/User';
import { BookingDataService } from '../../services/booking-data';

@Component({
  selector: 'app-confirm-booking',
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-booking.html',
  styleUrl: './confirm-booking.css',
})
export class ConfirmBooking implements OnInit, OnDestroy {
  // Trạng thái: 1 = thông tin liên hệ, 2 = thông tin đơn thuê, 3 = QR thanh toán, 4 = thành công
  currentPage = 1;

  // Countdown timer
  countdown = 10;
  countdownInterval: any;

  // Thông tin user và địa chỉ
  currentUser: iUser | null = null;
  userAddress: string = '';
  showAddressError: boolean = false;
  
  // Hình ảnh xe
  carImages: string[] = [];

  constructor(
    private cdr: ChangeDetectorRef, 
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private bookingDataService: BookingDataService
  ) { }

  ngOnInit(): void {
    // Lấy thông tin user đang đăng nhập
    this.currentUser = this.authService.getCurrentUser();
    
    // Lấy dữ liệu booking từ service
    const bookingData = this.bookingDataService.getBookingData();
    console.log('Booking data:', bookingData);
    
    // Cập nhật thông tin thanh toán nếu có
    if (bookingData.paymentInfo) {
      this.bookingData.payment.subtotal = bookingData.paymentInfo.subtotal;
      this.bookingData.payment.discount = bookingData.paymentInfo.discount;
      this.bookingData.payment.vat = bookingData.paymentInfo.vat;
      this.bookingData.payment.total = bookingData.paymentInfo.total;
      this.displayAmount = bookingData.paymentInfo.total; // Sync displayAmount
    }

    // Cập nhật thông tin xe nếu có
    if (bookingData.carInfo) {
      this.orderDetails.carInfo.name = bookingData.carInfo.name;
      this.orderDetails.carInfo.seats = bookingData.carInfo.seats;
      this.orderDetails.carInfo.fuel = bookingData.carInfo.fuel;
      this.orderDetails.carInfo.transmission = bookingData.carInfo.transmission;
      this.orderDetails.carInfo.fuelConsumption = bookingData.carInfo.fuelConsumption;
      this.carImages = bookingData.carInfo.images || [];
    }

    // Cập nhật thời gian từ booking data
    if (bookingData.pickupTime) {
      this.orderDetails.timeInfo.startTime = bookingData.pickupTime;
    }
    if (bookingData.returnTime) {
      this.orderDetails.timeInfo.endTime = bookingData.returnTime;
    }
    
    // Xử lý địa điểm nhận xe dựa trên lựa chọn
    if (bookingData.pickupOption === 'delivery' && bookingData.deliveryAddress) {
      // Nếu chọn giao xe tận nơi, hiển thị địa chỉ user nhập
      this.orderDetails.timeInfo.pickupLocation = bookingData.deliveryAddress;
    } else if (bookingData.location) {
      // Nếu chọn nhận tại vị trí xe, hiển thị vị trí xe
      this.orderDetails.timeInfo.pickupLocation = bookingData.location;
    }
  }

  // Dữ liệu thanh toán
  bookingData = {
    payment: {
      subtotal: 0,
      discount: 0,
      vat: 0,
      total: 0
    }
  };

  // Thông tin đơn thuê
  orderDetails = {
    carInfo: {
      name: '',
      seats: '',
      fuel: '',
      transmission: '',
      fuelConsumption: ''
    },
    timeInfo: {
      startTime: '',
      endTime: '',
      pickupLocation: ''
    }
  };

  // Số tiền hiển thị cho UI
  displayAmount = 0;

  // Thông tin QR code thanh toán (không có amount)
  qrPayment = {
    bankCode: 'VCB', // Vietcombank
    account: '9999999999',
    amount: 0, // Xóa số tiền khỏi QR
    message: 'Thanh toan don thue xe TrustCar Ma don 45',
    accountName: 'CONG TY TNHH CHO THUE XE TU LAI TRUSTCAR'
  };

  // Mã đơn thuê
  orderCode = '45';

  // Format tiền tệ VNĐ
  formatCurrency(amount: number): string {
    return amount.toLocaleString('vi-VN') + ' vnđ';
  }

  // Format thời gian cho dễ đọc
  formatDateTime(dateTime: string): string {
    if (!dateTime) return '';
    // Thay thế "T" bằng dấu cách và loại bỏ giây nếu có
    return dateTime.replace('T', ' ').split(':').slice(0, 2).join(':');
  }

  // Tạo URL QR code
  generateQRUrl(): string {
    const { bankCode, account, amount, message, accountName } = this.qrPayment;
    return `https://img.vietqr.io/image/${bankCode}-${account}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(message)}&accountName=${encodeURIComponent(accountName)}`;
  }

  // Bấm "Xác nhận đặt xe" -> chuyển sang trang 2
  onConfirmBooking(): void {
    if (!this.isValidContactInfo()) {
      this.showAddressError = true; // Hiển thị lỗi khi bấm nút mà chưa nhập
      return;
    }
    this.showAddressError = false; // Ẩn lỗi nếu hợp lệ
    this.currentPage = 2;
  }

  // Kiểm tra thông tin liên hệ có hợp lệ không
  isValidContactInfo(): boolean {
    return !!(this.userAddress && this.userAddress.trim().length > 0);
  }

  // Khi user nhập địa chỉ, ẩn thông báo lỗi
  onAddressInput(): void {
    if (this.showAddressError && this.userAddress && this.userAddress.trim().length > 0) {
      this.showAddressError = false;
    }
  }

  // Bấm "Xác nhận thanh toán" -> chuyển sang trang 3 (QR code) và bắt đầu countdown
  onConfirmPayment(): void {
    this.currentPage = 3;
    this.startCountdown();
  }

  // Bắt đầu countdown 10 giây
  startCountdown(): void {
    this.countdown = 10;
    console.log('Bắt đầu countdown từ:', this.countdown);

    const runCountdown = () => {
      this.countdown--;
      console.log('Countdown:', this.countdown);
      this.cdr.markForCheck(); // Force change detection
      this.cdr.detectChanges(); // Force update UI

      if (this.countdown <= 0) {
        console.log('Countdown kết thúc, chuyển trang 4');
        this.currentPage = 4;
        this.cdr.detectChanges();
      } else {
        this.countdownInterval = setTimeout(runCountdown, 1000);
      }
    };

    this.countdownInterval = setTimeout(runCountdown, 1000);
  }

  // Dọn dẹp timeout khi component bị destroy
  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearTimeout(this.countdownInterval);
    }
  }

  // Quay lại trang trước đó
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      // Nếu quay lại từ trang 3 hoặc 4, dừng countdown
      if (this.countdownInterval) {
        clearTimeout(this.countdownInterval);
        this.countdown = 10;
      }
    }
  }

  // Quay lại trang đầu
  goBackToHome(): void {
    this.currentPage = 1;
    this.countdown = 10;
    if (this.countdownInterval) {
      clearTimeout(this.countdownInterval);
    }
  }

  // Quay lại trang trước đó
  goBackToPreviousPage(): void {
    // Sử dụng history.back() để quay về trang trước đó
    window.history.back();
  }
}
