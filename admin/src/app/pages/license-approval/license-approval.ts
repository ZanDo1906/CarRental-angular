import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

interface iUserWithStatus extends iUser {
  Trang_thai: string;
}

@Component({
  selector: 'app-license-approval',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe], 
  templateUrl: './license-approval.html',
  styleUrls: ['./license-approval.css'],
})
export class LicenseApproval implements OnInit {

  users = signal<iUserWithStatus[]>([]);
  currentPage = signal<number>(1);
  itemsPerPage: number = 5; 

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
    this.http.get<iUser[]>('assets/data/User.json').subscribe({
      next: (loadedUsers) => {
        
        const usersWithStatus: iUserWithStatus[] = loadedUsers.map(user => ({
          ...user,
          Trang_thai: 'Chưa xét duyệt'
        }));

        this.users.set(usersWithStatus);
      },
      error: (err) => console.error('Lỗi khi tải dữ liệu user:', err),
    });
  }

  onAction(action: string, user: iUserWithStatus) {
    if (action === 'view') {
      alert(`Xem bằng lái của ${user.Ho_va_ten}. Số GPLX: ${user.Giay_phep_lai_xe}`);

    } else if (action === 'approve' || action === 'reject') {
      
      if (action === 'approve') {
        alert(`Đã duyệt bằng lái cho: ${user.Ho_va_ten}`);
      } else {
        alert(`Đã từ chối bằng lái của: ${user.Ho_va_ten}`);
      }

      this.users.update(currentUsers => 
        currentUsers.filter(u => u.Ma_nguoi_dung !== user.Ma_nguoi_dung)
      );

      if (this.displayedUsers().length === 0 && this.currentPage() > 1) {
        this.currentPage.set(this.currentPage() - 1);
      }
    }
  }

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
 
  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/img/default-avatar.png'; 
  }
}