import { Component } from '@angular/core';
import usersData from '../../../assets/data/User.json';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // 1. Import Router
import { OwnerService } from '../../services/owner.service'; // 2. Import OwnerService (kiểm tra lại đường dẫn)

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-management.html',
  styleUrl: './account-management.css',
})
export class AccountManagement {
  users = usersData;

  // 3. Thêm constructor để tiêm service
  constructor(
    private router: Router, 
    private ownerService: OwnerService
  ) {}

  // 4. Tạo hàm xử lý click
  viewUserDetail(user: any): void {
    if (user && user.Ma_nguoi_dung) {
      // 4a. Ghi ID của user được chọn vào service
      this.ownerService.setOwnerId(user.Ma_nguoi_dung);
      
      // 4b. Điều hướng đến trang chi tiết
      this.router.navigate(['/account-detail']); // (Bạn cần đảm bảo path này đúng)
    }
  }
}