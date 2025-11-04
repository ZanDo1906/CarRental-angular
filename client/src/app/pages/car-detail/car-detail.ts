import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../services/car';
import { LocationService } from '../../services/location';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  // CHỈ để các module/directive thực sự cần render
  imports: [CommonModule, FormsModule],
  templateUrl: './car-detail.html',
  styleUrl: './car-detail.css',
})
export class CarDetail implements OnInit {
  id!: string | null;
  car: any;
  locations: any[] = [];
  
  // Lightbox
  showLightbox = false;
  currentImageIndex = 0;

  // Favorite
  isFavorite = false;

  constructor(
    private route: ActivatedRoute,
    private carService: CarService,
    private locationService: LocationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    console.log('CarDetail ngOnInit - ID:', this.id);

    // load chi tiết xe theo id
    if (this.id) {
      this.carService.getAllCars().subscribe({
        next: (list) => {
          console.log('Received car list:', list);
          this.car = Array.isArray(list)
            ? list.find((x: any) => String(x.Ma_xe) === String(this.id))
            : null;
          console.log('Found car:', this.car);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading cars:', err);
        }
      });
    }

    // load locations to resolve addresses
    this.locationService.getAllLocations().subscribe({ 
      next: (data: any) => {
        this.locations = Array.isArray(data) ? data : [];
        console.log('Loaded locations:', this.locations.length);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading locations:', err);
      }
    });
  }

  // Lightbox functions
  openLightbox(index: number) {
    this.currentImageIndex = index;
    this.showLightbox = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.showLightbox = false;
    document.body.style.overflow = 'auto';
  }

  nextImage(event: Event) {
    event.stopPropagation();
    if (this.car?.Anh_xe?.length) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.car.Anh_xe.length;
    }
  }

  prevImage(event: Event) {
    event.stopPropagation();
    if (this.car?.Anh_xe?.length) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.car.Anh_xe.length) % this.car.Anh_xe.length;
    }
  }

  vnd(n: number | string | undefined) {
    if (n == null) return '';
    const x = typeof n === 'number' ? n : Number(n);
    return x.toLocaleString('vi-VN') + ' ₫';
  }

  getLocationById(id: number): any {
    return this.locations?.find((loc: any) => loc.Ma_vi_tri == id);
  }

  getLocationAddress(id: number): string {
    const location = this.getLocationById(id);
    if (location) {
      return `${location.Dia_chi_cu_the || ''}${location.Phuong_xa ? ', ' + location.Phuong_xa : ''}${location.Quan_huyen ? ', ' + location.Quan_huyen : ''}${location.Tinh_thanh ? ', ' + location.Tinh_thanh : ''}`;
    }
    return 'Chưa cập nhật';
  }

  getLocationCity(): string {
    if (!this.car?.Ma_vi_tri) return '';
    const location = this.getLocationById(this.car.Ma_vi_tri);
    return location ? (location.Quan_huyen + ', ' + location.Tinh_thanh) : '';
  }

  getCarStatus(): { label: string; class: string } {
    if (!this.car?.Bao_hanh_gan_nhat) {
      return { label: 'Chưa có thông tin', class: 'status-unknown' };
    }

    const maintenanceDate = new Date(this.car.Bao_hanh_gan_nhat);
    const today = new Date();
    const diffTime = today.getTime() - maintenanceDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 90) {
      return { label: 'Đã bảo dưỡng gần đây', class: 'status-good' };
    } else if (diffDays >= 90 && diffDays <= 180) {
      return { label: 'Sắp đến hạn bảo dưỡng', class: 'status-warning' };
    } else {
      return { label: 'Cần bảo dưỡng', class: 'status-danger' };
    }
  }

  getOwnerName(): string {
    return this.car?.Ten_chu_xe || 'Chủ xe';
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }

  shareLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Đã sao chép liên kết!');
    }).catch(() => {
      alert('Không thể sao chép liên kết. Vui lòng thử lại.');
    });
  }

  goBack() { this.router.navigate(['/']); }

  contactOwner() {
    // placeholder: implement contact flow
    alert('Liên hệ chủ xe (chức năng chưa triển khai)');
  }
}

