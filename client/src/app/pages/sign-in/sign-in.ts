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

        this.userService.addUser(newUser).subscribe(() => {
          // Chỉ lưu user mới, KHÔNG tự động đăng nhập
          
          // Hiển thị thông báo thành công
          alert('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');

          const modalEl = document.getElementById('signUpModal');
          if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.hide();
          }

          // Reset form
          this.email = this.hoTen = this.phoneNumber = this.password = this.confirmPassword = '';
          this.agreed = true;
        });
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
}
