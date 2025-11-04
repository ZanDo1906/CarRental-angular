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
  hero: string | null = null;
  locations: any[] = [];

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
          this.hero = this.car?.Anh_xe?.[0] || null;
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

  setHero(url: string) { this.hero = url; }

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

  goBack() { this.router.navigate(['/']); }

  contactOwner() {
    // placeholder: implement contact flow
    alert('Liên hệ chủ xe (chức năng chưa triển khai)');
  }
}

