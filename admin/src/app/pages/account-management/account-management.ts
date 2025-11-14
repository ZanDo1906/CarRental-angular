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
  currentPage = 1;
  pageSize = 10; 

  get sortedUsers() {
    let sorted = [...this.users];
    if (this.sortType === 'az') {
      sorted.sort((a, b) => a.Ho_va_ten.localeCompare(b.Ho_va_ten));
    } else if (this.sortType === 'newest') {
      sorted.sort((a, b) => new Date(b.Ngay_tao).getTime() - new Date(a.Ngay_tao).getTime());
    } else if (this.sortType === 'oldest') {
      sorted.sort((a, b) => new Date(a.Ngay_tao).getTime() - new Date(b.Ngay_tao).getTime());
    }
    return sorted;
  }

  get pagedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedUsers.slice(start, start + this.pageSize);
  }


  get totalPages() {
    return Math.ceil(this.users.length / this.pageSize);
  }


  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }


  setPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }

  setSort(type: 'az' | 'newest' | 'oldest') {
    this.sortType = type;
    this.currentPage = 1;
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