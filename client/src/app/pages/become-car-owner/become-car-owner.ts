import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';


@Component({
  selector: 'app-become-car-owner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './become-car-owner.html',
  styleUrl: './become-car-owner.css',
})
export class BecomeCarOwner {
  showLoginPopup: boolean = false;

  constructor(
    private el: ElementRef,
    private router: Router,
    private authService: AuthService
  ) { }

  goToRegisterOwner() {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (this.authService.isAuthenticated()) {
      // Nếu đã đăng nhập, chuyển đến trang đăng ký xe
      this.router.navigate(['/dk-cho-thue-xe']);
    } else {
      // Nếu chưa đăng nhập, hiển thị popup thông báo
      this.showLoginPopup = true;
    }
  }

  // Đóng popup
  closeLoginPopup(): void {
    this.showLoginPopup = false;
  }

  // Chuyển đến trang đăng nhập hoặc mở modal đăng nhập
  goToLogin(): void {
    this.showLoginPopup = false;
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
}
