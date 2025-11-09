import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin';
import { AuthService } from '../../services/auth.service';
import { iAdmin } from '../../interfaces/Admin';

declare var bootstrap: any;

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {
  phoneNumber: string = '';
  password: string = '';
  errorMessage: string = '';

  @Output() loginSuccess = new EventEmitter<iAdmin>();

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) { }

  onLogin(): void {
    // Hiển thị thông báo lỗi ngay lập tức
    this.errorMessage = 'Số điện thoại hoặc mật khẩu không đúng';

    // Validate input
    if (!this.phoneNumber || !this.password) {
      this.errorMessage = 'Vui lòng nhập đầy đủ số điện thoại và mật khẩu';
      return;
    }

    // Get all admins and check credentials
    this.adminService.getAllAdmins().subscribe({
      next: (admins: iAdmin[]) => {
        const admin = admins.find(
          a => a.So_dien_thoai === this.phoneNumber && a.Mat_khau === this.password
        );

        if (admin) {
          // Login successful - sử dụng AuthService
          this.authService.login(admin);

          // Emit event cho header
          this.loginSuccess.emit(admin);

          // Dispatch custom event cho các component khác
          console.log('Dispatching adminLoggedIn event');
          window.dispatchEvent(new CustomEvent('adminLoggedIn', { detail: admin }));

          // Đóng modal (nếu có)
          const modalElement = document.getElementById('loginModal');
          if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
              modal.hide();
            }
          }

          // Reset form
          this.phoneNumber = '';
          this.password = '';
          this.errorMessage = '';

          // Chuyển hướng đến dashboard
          this.router.navigate(['/dashboard']);
        }
        // Không cần else vì thông báo lỗi đã hiển thị từ đầu
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy dữ liệu admin:', err);
        this.errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      }
    });
  }

  An_Hien_Password() {
    const passwordInput = document.getElementById('matkhau') as HTMLInputElement;
    const toggleIcon = document.getElementById('togglePassword');

    if (passwordInput && toggleIcon) {
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
}
