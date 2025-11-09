import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { iAdmin } from '../../interfaces/Admin';

@Component({
  selector: 'app-admin-account',
  imports: [],
  templateUrl: './admin-account.html',
  styleUrl: './admin-account.css',
})
export class AdminAccount implements OnInit {
  admin: iAdmin | null = null;
  soChuyen: number = 0;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentAdmin$.subscribe(admin => {
      if (admin) {
        this.admin = { ...admin };
        // Gán giới tính mặc định là "Nữ" nếu không có
        if (!(this.admin as any).Gioi_tinh) {
          (this.admin as any).Gioi_tinh = 'Nữ';
        }
      } else {
        this.admin = admin;
      }
    });
  }

  get gioiTinh(): string {
    return (this.admin as any)?.Gioi_tinh || 'Chưa cập nhật';
  }

  get ngaySinh(): string {
    return (this.admin as any)?.Ngay_sinh || 'Chưa cập nhật';
  }

  get avatarUrl(): string {
    return this.admin?.Anh_dai_dien || '/assets/images/admin_avt.png';
  }
}
