import { Component, OnInit, signal, computed } from '@angular/core'; // 1. Thêm 'computed'
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { iCar } from '../../interfaces/Car'; 
import { iLocation } from '../../interfaces/location'; 
import { forkJoin } from 'rxjs'; 

interface iCarWithLocation extends iCar {
  Vi_tri?: string;
}

@Component({
  selector: 'app-car-registration-approval',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './car-registration-approval.html',
  styleUrls: ['./car-registration-approval.css'],
})
export class CarRegistrationApproval implements OnInit {
  
  // 1. Signal NGUỒN (chứa TẤT CẢ xe)
  cars = signal<iCarWithLocation[]>([]);

  // 2. Thêm các signal cho việc phân trang
  currentPage = signal<number>(1);
  itemsPerPage: number = 5; // Giới hạn 5 xe/trang

  // 3. Signal TÍNH TOÁN (chỉ chứa 5 xe để hiển thị)
  displayedCars = computed(() => {
    const page = this.currentPage();
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    // Tự động cắt 5 xe từ signal nguồn 'cars()'
    return this.cars().slice(startIndex, endIndex);
  });

  // 4. Signal TÍNH TOÁN (tổng số trang)
  totalPages = computed(() => {
    return Math.ceil(this.cars().length / this.itemsPerPage);
  });

  // 5. Signal TÍNH TOÁN (mảng số trang, ví dụ: [1, 2, 3])
  totalPagesArray = computed(() => {
    // Tạo một mảng [1, 2, ...] dựa trên tổng số trang
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });


  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    forkJoin({
      carsData: this.http.get<iCar[]>('assets/data/Car.json'),
      // Đảm bảo đường dẫn này chính xác
      locationsData: this.http.get<iLocation[]>('assets/data/location.json'), 
    }).subscribe({
      next: (results) => {
        const locationsMap = new Map<string, iLocation>();
        results.locationsData.forEach((loc) => {
          locationsMap.set(String(loc.Ma_vi_tri), loc);
        });

        const carsWithLocation: iCarWithLocation[] = results.carsData.map((car) => {
          const locationKey = String(car.Ma_vi_tri);
          const location = locationsMap.get(locationKey);
          let vi_tri_day_du = 'Không rõ địa điểm';
          if (location) {
            vi_tri_day_du = `${location.Dia_chi_cu_the}, ${location.Phuong_xa}, ${location.Quan_huyen}, ${location.Tinh_thanh}`;
          }
          return { ...car, Vi_tri: vi_tri_day_du };
        });

        // Gán dữ liệu vào signal NGUỒN
        this.cars.set(carsWithLocation);
      },
      error: (err) => console.error('Lỗi khi tải dữ liệu:', err),
    });
  }

  onAction(action: string, car: iCarWithLocation) {
    if (action === 'detail') {
      this.router.navigate(['/admin/car-detail', car.Ma_xe]);

    } else if (action === 'approve' || action === 'reject') {
      
      if (action === 'approve') {
        alert(`✅ Đã duyệt xe: ${car.Hang_xe} ${car.Dong_xe}`);
      } else {
        alert(`❌ Đã từ chối xe: ${car.Hang_xe} ${car.Dong_xe}`);
      }
      
      // 1. Cập nhật signal NGUỒN (cars)
      this.cars.update(currentCars => 
        currentCars.filter(c => c.Ma_xe !== car.Ma_xe)
      );

      // 2. Kiểm tra lại trang
      // Nếu xóa hết xe ở trang hiện tại, lùi về 1 trang
      if (this.displayedCars().length === 0 && this.currentPage() > 1) {
        this.currentPage.set(this.currentPage() - 1);
      }
    }
  }

  // === CÁC HÀM PHÂN TRANG MỚI ===
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

  // ... (các hàm formatNumber, formatCurrencyShort, onImageError giữ nguyên) ...
  formatNumber(num: number): string {
    return num?.toLocaleString('vi-VN') || '0';
  }
  formatCurrencyShort(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}tr`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
    return `${num}`;
  }
  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/img/default-car.png';
  }
}