import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-side-bar',
  imports: [RouterModule, CommonModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar implements OnInit {

  public isSidebarOpen = false;
  public currentUrl = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Theo dõi thay đổi route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.url;
      });

    // Set initial URL
    this.currentUrl = this.router.url;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Kiểm tra xem có phải đang ở trang quản lý tài khoản không (bao gồm cả account-detail)
  isAccountManagementActive(): boolean {
    return this.currentUrl.includes('/account') || this.currentUrl.includes('/account-detail');
  }

  // Kiểm tra xem có phải đang ở trang quản lý xe không (bao gồm cả vehicle-detail)
  isVehicleManagementActive(): boolean {
    return this.currentUrl.includes('/vehicle-management') || this.currentUrl.includes('/vehicle-detail');
  }

  // Kiểm tra xem có phải đang ở trang duyệt xe không (bao gồm cả car-detail-approval)
  isCarApprovalActive(): boolean {
    return this.currentUrl.includes('/car-registration-approval') || this.currentUrl.includes('/car-detail-approval');
  }

  logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}