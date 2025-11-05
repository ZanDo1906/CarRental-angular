import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../services/car';
import { LocationService } from '../../services/location';

@Component({
  selector: 'app-car-detail-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './car-detail-approval.html',
  styleUrl: './car-detail-approval.css',
})
export class CarDetail implements OnInit {
  id!: string | null;
  car: any;
  locations: any[] = [];
  
  showLightbox = false;
  currentImageIndex = 0;

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

  getOwnerName(): string {
    return this.car?.Ten_chu_xe || 'Chủ xe';
  }

  goBack() { this.router.navigate(['/']); }

  contactOwner() {
    alert('Liên hệ chủ xe (chức năng chưa triển khai)');
  }
}

