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
  sortType: 'az' | 'newest' | 'oldest' = 'az';

  get sortedUsers() {
    let sorted = [...this.users];
    if (this.sortType === 'az') {
      sorted.sort((a, b) => a.Ma_nguoi_dung - b.Ma_nguoi_dung);
    } else if (this.sortType === 'newest') {
      sorted.sort((a, b) => new Date(b.Ngay_tao).getTime() - new Date(a.Ngay_tao).getTime());
    } else if (this.sortType === 'oldest') {
      sorted.sort((a, b) => new Date(a.Ngay_tao).getTime() - new Date(b.Ngay_tao).getTime());
    }
    return sorted;
  }

  setSort(type: 'az' | 'newest' | 'oldest') {
    this.sortType = type;
  }

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