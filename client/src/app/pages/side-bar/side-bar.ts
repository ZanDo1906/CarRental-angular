import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { OwnerService } from '../../services/owner.service';
import { AuthService } from '../../services/auth';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-side-bar',
  imports: [RouterModule, CommonModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar implements OnInit {
  ownerId: number | null = null;
  isDropdownOpen = false;
  currentPageTitle = 'Quản lý tài khoản';

  constructor(
    private ownerService: OwnerService,
    private authService: AuthService,
    private router: Router
  ) {
    // initialize from service/localStorage and react to changes
    this.ownerId = this.ownerService.getOwnerId();
    this.ownerService.ownerId$.subscribe(id => this.ownerId = id);
  }

  ngOnInit() {
    // Update page title based on current route
    this.updatePageTitle();
    
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
      });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  private updatePageTitle() {
    const currentUrl = this.router.url;
    
    if (currentUrl.includes('user-account')) {
      this.currentPageTitle = 'Tài khoản của tôi';
    } else if (currentUrl.includes('user-car')) {
      this.currentPageTitle = 'Xe của tôi';
    } else if (currentUrl.includes('user-rental')) {
      this.currentPageTitle = 'Chuyến của tôi';
    } else if (currentUrl.includes('car-registration-approval')) {
      this.currentPageTitle = 'Quà tặng';
    } else if (currentUrl.includes('dashboard')) {
      this.currentPageTitle = 'Dashboard';
    } else {
      this.currentPageTitle = 'Quản lý tài khoản';
    }
  }

  logout() {
    this.authService.logout();
    // Không cần navigate vì header sẽ tự động cập nhật trạng thái
    // this.router.navigate(['/']);
  }
}
