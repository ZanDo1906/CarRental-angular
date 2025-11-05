import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Thêm DatePipe
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

// 1. Tạo interface cho User
interface iUser {
  Ma_nguoi_dung: number;
  Ho_va_ten: string;
  So_dien_thoai: string;
  Email: string;
  Giay_phep_lai_xe: string;
  Anh_dai_dien: string;
  Ngay_tao: string;
  Vai_tro: string;
}

// 2. Thêm interface "ảo" để mô phỏng trạng thái
interface iUserWithStatus extends iUser {
  Trang_thai: string;
}

@Component({
  selector: 'app-license-approval',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe], // Thêm DatePipe vào imports
  templateUrl: './license-approval.html',
  styleUrls: ['./license-approval.css'],
})
export class LicenseApproval implements OnInit {

  // === Tương tự component trước ===
  users = signal<iUserWithStatus[]>([]);
  currentPage = signal<number>(1);
  itemsPerPage: number = 5; // Bạn có thể đổi số lượng item/trang

  // Tính toán danh sách user hiển thị cho trang hiện tại
  displayedUsers = computed(() => {
    const page = this.currentPage();
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.users().slice(startIndex, endIndex);
  });

  // Tính tổng số trang
  totalPages = computed(() => {
    return Math.ceil(this.users().length / this.itemsPerPage);
  });

  // Tạo mảng số trang để *ngFor lặp qua
  totalPagesArray = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // 3. Tải file User.json
    this.http.get<iUser[]>('assets/data/User.json').subscribe({
      next: (loadedUsers) => {
        
        // 4. Thêm trạng thái "Chưa xét duyệt" (vì JSON gốc không có)
        const usersWithStatus: iUserWithStatus[] = loadedUsers.map(user => ({
          ...user,
          Trang_thai: 'Chưa xét duyệt' // Mô phỏng trạng thái như hình
        }));

        this.users.set(usersWithStatus);
      },
      error: (err) => console.error('Lỗi khi tải dữ liệu user:', err),
    });
  }

  // 5. Xử lý các nút bấm
  onAction(action: string, user: iUserWithStatus) {
    if (action === 'view') {
      // Bạn có thể mở một modal/popup ở đây
      alert(`Xem bằng lái của ${user.Ho_va_ten}. Số GPLX: ${user.Giay_phep_lai_xe}`);

    } else if (action === 'approve' || action === 'reject') {
      
      if (action === 'approve') {
        alert(`Đã duyệt bằng lái cho: ${user.Ho_va_ten}`);
      } else {
        alert(`Đã từ chối bằng lái của: ${user.Ho_va_ten}`);
      }
      
      // Xóa user khỏi danh sách (signal)
      this.users.update(currentUsers => 
        currentUsers.filter(u => u.Ma_nguoi_dung !== user.Ma_nguoi_dung)
      );

      // Tự động lùi trang nếu xóa hết item ở trang cuối
      if (this.displayedUsers().length === 0 && this.currentPage() > 1) {
        this.currentPage.set(this.currentPage() - 1);
      }
    }
  }

  // === Các hàm phân trang (giữ nguyên) ===
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }
  
  // Xử lý lỗi ảnh (dùng ảnh default)
  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/img/default-avatar.png'; // Tạo 1 ảnh default
  }
}