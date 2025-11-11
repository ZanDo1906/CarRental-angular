import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { iAdmin } from '../../interfaces/Admin';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-admin-account',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './admin-account.html',
  styleUrl: './admin-account.css',
})
export class AdminAccount implements OnInit {
  admin: iAdmin | null = null;
  soChuyen: number = 0;
  
  // ----- CÁC BIẾN VÀ HÀM CẦN THIẾT -----
  editingProfile: boolean = false;
  private originalAdmin: iAdmin | null = null; // Dùng để Hủy thay đổi

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentAdmin$.subscribe(admin => {
      if (admin) {
        this.admin = { ...admin };
        this.originalAdmin = { ...admin }; // Lưu bản gốc
        
        // **Đã loại bỏ logic gán mặc định cho Gioi_tinh và Ngay_sinh**
      } else {
        this.admin = null;
        this.originalAdmin = null;
      }
    });
  }

  // **Đã loại bỏ getter gioiTinh()**
  // **Đã loại bỏ getter ngaySinh()**

  get avatarUrl(): string {
    return this.admin?.Anh_dai_dien || '/assets/images/admin_avt.png';
  }

  loadAdmin(): void {
    // Thêm logic tải lại admin nếu cần
    console.log('Tải lại thông tin admin...');
    // Ví dụ: this.authService.refreshAdmin();
  }

  onEdit(section: string): void {
    if (section === 'profile') {
      this.editingProfile = true;
    }
  }

  saveAdmin(): void {
    if (this.admin) {
      console.log('Đang lưu admin:', this.admin);
      // Nơi bạn gọi service để cập nhật admin
      // this.authService.updateAdmin(this.admin).subscribe(updatedAdmin => {
      //   this.admin = { ...updatedAdmin };
      //   this.originalAdmin = { ...updatedAdmin };
      //   this.editingProfile = false;
      // });
      this.editingProfile = false; // Tạm thời
      this.originalAdmin = { ...this.admin }; // Cập nhật bản gốc sau khi lưu
    }
  }

  cancelEdit(): void {
    if (this.originalAdmin) {
      this.admin = { ...this.originalAdmin }; // Hoàn tác lại
    }
    this.editingProfile = false;
  }
}