import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user';
import { iUser } from '../../interfaces/User';

declare var bootstrap: any;

@Component({
  selector: 'app-sign-in',
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  @Output() registerSuccess = new EventEmitter<iUser>();

  email: string = '';
  hoTen: string = '';
  phoneNumber: string = '';
  password: string = '';
  confirmPassword: string = '';
  agreed: boolean = true;
  errorMessage: string = '';

  // OTP verification
  showVerification: boolean = false;
  otp: string[] = ['', '', '', '', '', ''];
  maskedIdentifier: string = '';
  pendingUser: iUser | null = null;

  constructor(private userService: UserService) {}

  onRegister(): void {
    this.errorMessage = '';

    // Basic validation
    if (!this.email || !this.hoTen || !this.phoneNumber || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Mật khẩu nhập lại không khớp';
      return;
    }
    if (!this.agreed) {
      this.errorMessage = 'Bạn cần đồng ý với Chính sách & Quy định';
      return;
    }

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const existed = users.some(u => u.So_dien_thoai === this.phoneNumber);
        if (existed) {
          this.errorMessage = 'Số điện thoại đã tồn tại';
          return;
        }

        const maxId = users.reduce((m, u) => Math.max(m, u.Ma_nguoi_dung), 0);
        const newUser: iUser = {
          Ma_nguoi_dung: maxId + 1,
          Ho_va_ten: this.hoTen,
          So_dien_thoai: this.phoneNumber,
          Email: this.email,
          Mat_khau: this.password,
          Vai_tro: '1',
          Anh_dai_dien: './assets/images/user_avt.jpg',
          Ngay_tao: new Date().toISOString().slice(0,10),
          So_lan_vi_pham: 0
        };

        // Store user temporarily and show OTP verification
        this.pendingUser = newUser;
        this.maskedIdentifier = this.maskIdentifier(this.phoneNumber);
        this.showVerification = true;
        this.errorMessage = '';
        
        // Simulate sending OTP
        console.log('Sending OTP to:', this.phoneNumber);
      },
      error: () => {
        this.errorMessage = 'Không thể đăng ký lúc này. Vui lòng thử lại.';
      }
    });
  }

  togglePassword(inputId: string, iconId: string) {
    const passwordInput = document.getElementById(inputId) as HTMLInputElement | null;
    const toggleIcon = document.getElementById(iconId);
    if (!passwordInput || !toggleIcon) return;
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.classList.remove('bi-eye');
      toggleIcon.classList.add('bi-eye-slash');
    } else {
      passwordInput.type = 'password';
      toggleIcon.classList.remove('bi-eye-slash');
      toggleIcon.classList.add('bi-eye');
    }
  }

  // OTP methods
  onOtpInput(event: any, index: number): void {
    const input = event.target;
    const value = input.value;

    if (value && /^\d$/.test(value)) {
      this.otp[index] = value;
      
      // Auto focus next input
      if (index < 5) {
        const nextInput = document.getElementById(`otp${index + 1}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else {
      input.value = '';
      this.otp[index] = '';
    }
  }

  onVerify(): void {
    const otpCode = this.otp.join('');
    if (otpCode.length !== 6) {
      alert('Vui lòng nhập đầy đủ 6 số');
      return;
    }

    // Simulate OTP verification (always success for demo)
    if (this.pendingUser) {
      this.userService.addUser(this.pendingUser).subscribe(() => {
        // Lưu thông tin user vào localStorage để nhớ (SĐT + mật khẩu)
        localStorage.setItem('rememberedUser', JSON.stringify({
          phone: this.pendingUser!.So_dien_thoai,
          password: this.pendingUser!.Mat_khau,
          email: this.pendingUser!.Email,
          name: this.pendingUser!.Ho_va_ten
        }));

        // Hiển thị thông báo thành công
        alert('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');

        const modalEl = document.getElementById('signUpModal');
        if (modalEl) {
          const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          modal.hide();
        }

        // Reset form
        this.resetForm();
      });
    }
  }

  onResend(event: Event): void {
    event.preventDefault();
    // Simulate resend OTP
    alert('Mã xác thực đã được gửi lại!');
    this.otp = ['', '', '', '', '', ''];
  }

  private resetForm(): void {
    this.email = this.hoTen = this.phoneNumber = this.password = this.confirmPassword = '';
    this.agreed = true;
    this.showVerification = false;
    this.otp = ['', '', '', '', '', ''];
    this.maskedIdentifier = '';
    this.pendingUser = null;
    this.errorMessage = '';
  }

  private maskIdentifier(identifier: string): string {
    if (identifier.includes('@')) {
      // Email
      const [name, domain] = identifier.split('@');
      const maskedName = name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
      return `${maskedName}@${domain}`;
    } else {
      // Phone number
      return identifier.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
    }
  }
}
