import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user';
import { iUser } from '../../interfaces/User';

declare var bootstrap: any;

@Component({
  selector: 'app-log-in',
  imports: [CommonModule, FormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {
  phoneNumber: string = '';
  password: string = '';
  errorMessage: string = '';
  
  @Output() loginSuccess = new EventEmitter<iUser>();

  constructor(private userService: UserService) {}

  onLogin(): void {
    // Reset error message
    this.errorMessage = '';

    // Validate input
    if (!this.phoneNumber || !this.password) {
      this.errorMessage = 'Vui lòng nhập đầy đủ số điện thoại và mật khẩu';
      return;
    }

    // Get all users and check credentials
    this.userService.getAllUsers().subscribe({
      next: (users: iUser[]) => {
        const user = users.find(
          u => u.So_dien_thoai === this.phoneNumber && u.Mat_khau === this.password
        );

        if (user) {
          // Login successful - lưu vào localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // Emit event cho header
          this.loginSuccess.emit(user);
          
          // Dispatch custom event cho các component khác
          console.log('Dispatching userLoggedIn event');
          window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
          
          // Đóng modal
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
        } else {
          // Login failed
          this.errorMessage = 'Số điện thoại hoặc mật khẩu không đúng';
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu người dùng:', err);
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
