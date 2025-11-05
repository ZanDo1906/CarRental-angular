import { Component, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-booking',
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-booking.html',
  styleUrl: './confirm-booking.css',
})
export class ConfirmBooking implements OnDestroy {
  // Trạng thái: 1 = thông tin liên hệ, 2 = thông tin đơn thuê, 3 = QR thanh toán, 4 = thành công
  currentPage = 1;

  // Countdown timer
  countdown = 10;
  countdownInterval: any;

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) { }

  // Dữ liệu trang 1 - Thông tin liên hệ & thanh toán
  bookingData = {
    contact: {
      name: 'Nguyễn Văn A',
      phone: '0912345678',
      email: 'nguyenvana@email.com',
      address: '123 Đường ABC, Quận 1, TP.HCM'
    },
    payment: {
      subtotal: 1100000,
      discount: 0,
      vat: 50000,
      total: 1150000
    }
  };

  // Dữ liệu trang 2 - Thông tin đơn thuê
  orderDetails = {
    carInfo: {
      name: 'HYUNDAI KONA 2019',
      seats: '4 chỗ',
      fuel: 'Xăng',
      transmission: 'Tự động',
      fuelConsumption: '10L/100km'
    },
    timeInfo: {
      startTime: '',
      endTime: '',
      pickupLocation: ''
    }
  };

  // Số tiền hiển thị cho UI (giữ nguyên)
  displayAmount = 1150000;

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

  // Tạo URL QR code
  generateQRUrl(): string {
    const { bankCode, account, amount, message, accountName } = this.qrPayment;
    return `https://img.vietqr.io/image/${bankCode}-${account}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(message)}&accountName=${encodeURIComponent(accountName)}`;
  }

  // Bấm "Xác nhận đặt xe" -> chuyển sang trang 2
  onConfirmBooking(): void {
    this.currentPage = 2;
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

  // Quay lại trang đầu
  goBackToHome(): void {
    this.currentPage = 1;
    this.countdown = 10;
    if (this.countdownInterval) {
      clearTimeout(this.countdownInterval);
    }
  }
}
