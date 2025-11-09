import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { OwnerService } from '../../services/owner.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-side-bar',
  imports: [RouterModule, CommonModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar {
  ownerId: number | null = null;
  isDropdownOpen = false;

  constructor(
    private ownerService: OwnerService,
    private authService: AuthService,
    private router: Router
  ) {
    // initialize from service/localStorage and react to changes
    this.ownerId = this.ownerService.getOwnerId();
    this.ownerService.ownerId$.subscribe(id => this.ownerId = id);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.authService.logout();
    // Không cần navigate vì header sẽ tự động cập nhật trạng thái
    // this.router.navigate(['/']);
  }
}
