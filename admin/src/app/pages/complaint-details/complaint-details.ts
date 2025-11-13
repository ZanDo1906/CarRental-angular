// ...existing imports...
import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ActivatedRoute, Router } from '@angular/router';
import { Complaints } from '../../services/complaints';
import { iComplaint } from '../../interfaces/complaints';
import { UserService } from '../../services/user';
import { CarRental } from '../../services/car-rental';
import { iUser } from '../../interfaces/User';
import { LocationService } from '../../services/location';

@Component({
  selector: 'app-complaint-details',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './complaint-details.html',
  styleUrl: './complaint-details.css',
})
export class ComplaintDetails implements OnInit {
  showAlert(message: string) {
    window.alert(message);
  }
  constructor(
    private route: ActivatedRoute,
    private complaintsService: Complaints,
    private userService: UserService,
    private carRentalService: CarRental,
    private locationService: LocationService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  goToAccountDetail(user: iUser) {
    if (user && user.Ma_nguoi_dung) {
      this.router.navigate([`/account-detail/${user.Ma_nguoi_dung}`]);
    }
  }
  getStatusText(status: string | undefined): string {
    if (!status) return '---';
    switch (status) {
      case 'DANG_XU_LY': return 'Đang xử lý';
      case 'DA_GIAI_QUYET': return 'Đã giải quyết';
      case 'TU_CHOI': return 'Từ chối';
      default: return status.replace(/_/g, ' ');
    }
  }
  complaint: iComplaint | null = null;
  userK: iUser | null = null; // Tài khoản khiếu nại
  userB: iUser | null = null; // Tài khoản bị khiếu nại
  loading = true;
  error: string | null = null;
  carRental: import('../../interfaces/Car_rental').iCar_rental | null = null;
  locationNhan: import('../../interfaces/location').iLocation | null = null;
  locationTra: import('../../interfaces/location').iLocation | null = null;
  showAccountDropdown: boolean = false;

  onAccountDropdown(show: boolean) {
    this.showAccountDropdown = show;
    this.cdr.detectChanges();
  }

  // ...existing code...

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID truyền vào complaint-details:', id);
    this.loading = true;
    this.complaintsService.getAllComplaints().subscribe({
      next: (data: iComplaint[]) => {
        this.complaint = data.find(c => Number(c.Ma_khieu_nai) === id) || null;
        if (this.complaint) {
          this.carRentalService.getAllCars().subscribe(rentals => {
            this.carRental = rentals.find(r => Number(r.Ma_don_thue) === Number(this.complaint?.Ma_don_thue)) || null;
            if (this.carRental) {
              this.locationService.getAllLocations().subscribe(locations => {
                this.locationNhan = locations.find(l => Number(l.Ma_vi_tri) === Number(this.carRental?.Ma_vi_tri_nhan)) || null;
                this.locationTra = locations.find(l => Number(l.Ma_vi_tri) === Number(this.carRental?.Ma_vi_tri_tra)) || null;
                this.cdr.detectChanges();
              });
            }
            this.userService.getAllUsers().subscribe(users => {
              this.userK = users.find(u => Number(u.Ma_nguoi_dung) === Number(this.complaint?.Tai_khoan_khieu_nai)) || null;
              this.userB = users.find(u => Number(u.Ma_nguoi_dung) === Number(this.complaint?.Tai_khoan_bi_khieu_nai)) || null;
              this.loading = false;
              this.cdr.detectChanges();
            });
          });
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.error = 'Không thể tải dữ liệu khiếu nại.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getRoleText(role: string | number): string {
    if (role === '1' || role === 1) return 'Khách thuê';
    if (role === '2' || role === 2) return 'Chủ xe';
    return 'Không xác định';
  }
}
