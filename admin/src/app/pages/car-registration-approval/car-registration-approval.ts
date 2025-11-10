import { Component, OnInit, signal, computed } from '@angular/core'; 
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

  cars = signal<iCarWithLocation[]>([]);

  currentPage = signal<number>(1);
  itemsPerPage: number = 5; 

  modalType = signal<'reject' | null>(null);
  selectedCar = signal<iCarWithLocation | null>(null);
  rejectionReason = signal<string>('');

  displayedCars = computed(() => {
    const page = this.currentPage();
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    return this.cars().slice(startIndex, endIndex);
  });

  totalPages = computed(() => {
    return Math.ceil(this.cars().length / this.itemsPerPage);
  });

  totalPagesArray = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });


  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    forkJoin({
      carsData: this.http.get<iCar[]>('assets/data/Car.json'),
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

        this.cars.set(carsWithLocation);
      },
      error: (err) => console.error('Lỗi khi tải dữ liệu:', err),
    });
  }

  onAction(action: string, car: iCarWithLocation) {
    if (action === 'detail') {
      this.router.navigate(['/car-detail-approval', car.Ma_xe]);
    } else if (action === 'approve') {
      alert(`Đã duyệt xe: ID ${car.Ma_xe}_${car.Hang_xe} ${car.Dong_xe} ${car.Nam_san_xuat}`);
      this.removeCar(car); 
    } else if (action === 'reject') {
      this.selectedCar.set(car);
      this.rejectionReason.set('');
      this.modalType.set('reject');
    }
  }

  private removeCar(car: iCarWithLocation) {
    this.cars.update((currentCars) =>
      currentCars.filter((c) => c.Ma_xe !== car.Ma_xe)
    );

    if (this.displayedCars().length === 0 && this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  closeModal() {
    this.modalType.set(null);
    this.selectedCar.set(null);
  }

  onReasonChange(event: Event) {
    const reason = (event.target as HTMLTextAreaElement).value;
    this.rejectionReason.set(reason);
  }

  submitRejection() {
    const car = this.selectedCar();
    const reason = this.rejectionReason();
    if (!car) return;

    if (reason.trim().length === 0) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }

    alert(
      `Đã từ chối xe ${car.Hang_xe} ${car.Dong_xe} với lý do: ${reason}`
    );
    this.removeCar(car);
    this.closeModal(); 
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