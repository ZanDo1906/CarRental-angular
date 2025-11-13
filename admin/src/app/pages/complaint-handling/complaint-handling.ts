import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Complaints } from '../../services/complaints';
import { iComplaint } from '../../interfaces/complaints';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-complaint-handling',
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './complaint-handling.html',
  styleUrl: './complaint-handling.css',
})
export class ComplaintHandling implements OnInit {
  complaints: iComplaint[] = [];
  loading = true;
  error: string | null = null;
  searchText: string = '';
  filterStatus: string = '';

  constructor(private complaintsService: Complaints, private cdr: ChangeDetectorRef, private router: Router) { }
  goToComplaintDetails(id: number) {
    this.router.navigate(['/complaint-details', id]);
  }

  ngOnInit(): void {
    this.complaintsService.getAllComplaints().subscribe({
      next: (data) => {
        this.complaints = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Không thể tải dữ liệu khiếu nại.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setStatus(status: string) {
    this.filterStatus = status;
  }

  get filteredComplaints(): iComplaint[] {
    const statusMap: { [key: string]: string } = {
      'Đã giải quyết': 'DA_GIAI_QUYET',
      'Đang xử lý': 'DANG_XU_LY',
      'Chờ xử lý': 'CHO_XU_LY',
      'Từ chối': 'TU_CHOI'
    };
    let filtered = this.complaints.filter(c =>
      c.Ma_khieu_nai.toString().includes(this.searchText)
      || c.Ma_don_thue.toString().includes(this.searchText)
      || c.Tai_khoan_khieu_nai.toString().includes(this.searchText)
      || c.Tai_khoan_bi_khieu_nai.toString().includes(this.searchText)
      || c.Noi_dung_khieu_nai.toLowerCase().includes(this.searchText.toLowerCase())
      || c.Trang_thai_khieu_nai.toLowerCase().includes(this.searchText.toLowerCase())
    );
    if (this.filterStatus && statusMap[this.filterStatus]) {
      return filtered.filter(c => c.Trang_thai_khieu_nai === statusMap[this.filterStatus]);
    }
    return filtered;
  }
}
