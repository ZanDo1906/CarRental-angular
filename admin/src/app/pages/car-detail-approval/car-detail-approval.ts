import { Component, OnInit, signal, ChangeDetectorRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CarService } from '../../services/car';
import { LocationService } from '../../services/location';
import { UserService } from '../../services/user';
import { OwnerService } from '../../services/owner.service';
import { iCar } from '../../interfaces/Car'; 
import { iLocation } from '../../interfaces/location'; 

interface iCarWithLocation extends iCar {
  Vi_tri?: string;
}

@Component({
  selector: 'app-car-detail-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './car-detail-approval.html',
  styleUrl: './car-detail-approval.css',
})
export class CarDetail implements OnInit {
  id!: string | null;
  car: any;
  owner: any = null;
  locations: any[] = [];

  showLightbox = false;
  currentImageIndex = 0;

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

  constructor(
    private route: ActivatedRoute,
    private carService: CarService,
    private locationService: LocationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private ownerService: OwnerService
  ) { }

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
          
          // Load owner data based on car's Ma_nguoi_dung
          if (this.car && this.car.Ma_nguoi_dung) {
            this.userService.getAllUsers().subscribe({
              next: (users) => {
                this.owner = Array.isArray(users) 
                  ? users.find((u: any) => u.Ma_nguoi_dung === this.car.Ma_nguoi_dung)
                  : null;
                console.log('Found owner:', this.owner);
                this.cdr.detectChanges();
              },
              error: (err) => {
                console.error('Error loading users:', err);
                this.cdr.detectChanges();
              }
            });
          } else {
            this.cdr.detectChanges();
          }
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
    return x.toLocaleString('vi-VN');
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

  goBack() { this.router.navigate(['/car-registration-approval']); }

  contactOwner() {
    alert('Liên hệ chủ xe (chức năng chưa triển khai)');
  }

  openOwnerDetail(ownerId: number | string): void {
    const id = Number(ownerId);
    if (isNaN(id)) return;
    try {
      this.ownerService.setOwnerId(id);
    } catch (e) {
      // ignore
    }
    this.router.navigate(['/account-detail', id]);
  }
}

