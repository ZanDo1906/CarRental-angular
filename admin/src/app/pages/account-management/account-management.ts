import { Component } from '@angular/core';
import usersData from '../../../assets/data/User.json';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OwnerService } from '../../services/owner.service';

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-management.html',
  styleUrl: './account-management.css',
})
export class AccountManagement {
  users = usersData;

  constructor(
    private router: Router,
    private ownerService: OwnerService
  ) { }

  viewUserDetail(user: any): void {
    if (user && user.Ma_nguoi_dung) {
      this.ownerService.setOwnerId(user.Ma_nguoi_dung);
      this.router.navigate(['/account-detail', user.Ma_nguoi_dung]);
    }
  }
}