import { Component, AfterViewInit, ElementRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingDataService } from '../../services/booking-data';
import { CarService } from '../../services/car';
import { LocationService } from '../../services/location';
import { iCar } from '../../interfaces/Car';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements AfterViewInit, OnInit { 

  // Filter data
  selectedLocation: string | null = null;
  pickupTime: string = '';
  returnTime: string = '';
  dateError: string = '';

  // Cars data
  cars: iCar[] = [];
  displayedCars: iCar[] = [];
  locations: any[] = [];

  //First
  constructor(
    private el: ElementRef, 
    private router: Router,
    private bookingDataService: BookingDataService,
    private carService: CarService,
    private locationService: LocationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load locations trước
    this.loadLocations();
    // Sau đó load cars
    this.loadCars();
  }

  ngAfterViewInit(): void {
    this.startCounter(); 
  }

  private startCounter(): void {
    const countElement = this.el.nativeElement.querySelector('#customer-count');

    if (!countElement) {
      console.error('Không tìm thấy #customer-count');
      return;
    }

    const start = 5000;
    const end = 10000;
    const duration = 2000; 
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const currentValue = Math.floor(start + (end - start) * percentage);

      countElement.innerText = currentValue.toLocaleString('vi-VN'); 

      if (progress < duration) {
        requestAnimationFrame(step);
      } else {
        countElement.innerText = end.toLocaleString('vi-VN');
      }
    };

    requestAnimationFrame(step);
  }

  goToOwnerPage() {
    this.router.navigate(['/owner']);
  }
  
  goToAboutTrustcar() {
    this.router.navigate(['/ve-trust-car']);
  }

  // Validate thời gian thuê/trả
  validateDates(): void {
    this.dateError = '';
    if (this.pickupTime && this.returnTime) {
      const pickup = new Date(this.pickupTime);
      const returnDate = new Date(this.returnTime);
      
      if (returnDate <= pickup) {
        this.dateError = 'Thời gian trả phải sau thời gian thuê';
        this.returnTime = '';
      }
    }
  }

  // Tìm xe - lưu dữ liệu và navigate đến carList
  searchCars(): void {
    // Lưu dữ liệu booking vào service (bao gồm cả địa điểm)
    this.bookingDataService.setBookingData({
      location: this.selectedLocation,
      pickupTime: this.pickupTime || '',
      returnTime: this.returnTime || ''
    });
    
    // Navigate đến trang danh sách xe
    this.router.navigate(['/danh-sach-xe']);
  }

  // Load 4 xe để hiển thị trên homepage
  loadCars(): void {
    this.carService.getAllCars().subscribe({
      next: (data) => {
        this.cars = data;
        this.displayedCars = this.cars.slice(0, 4); // Chỉ lấy 4 xe đầu tiên
        console.log('Đã load xe:', this.displayedCars.length, 'xe');
        console.log('Data xe:', this.displayedCars);
        this.cdr.detectChanges(); // Force Angular update UI
      },
      error: (err) => {
        console.error('Lỗi khi load xe:', err);
      }
    });
  }

  // Load locations
  loadLocations(): void {
    this.locationService.getAllLocations().subscribe({
      next: (data) => {
        this.locations = data;
        console.log('Đã load locations:', this.locations.length);
        this.cdr.detectChanges(); // Update UI sau khi có locations
      },
      error: (err) => {
        console.error('Lỗi khi load locations:', err);
      }
    });
  }

  // Navigate đến trang danh sách xe
  viewAllCars(): void {
    this.router.navigate(['/danh-sach-xe']);
  }

  // Navigate đến car detail
  goToCarDetail(id: number | string) {
      // Lưu dữ liệu booking vào service trước khi navigate
      this.bookingDataService.setBookingData({
        location: this.selectedLocation,
        pickupTime: this.pickupTime || '',
        returnTime: this.returnTime || ''
      });
      this.router.navigate(['/xe', id]);   // trỏ đúng path ở routes
    }

  // Format VND
  formatVND(n: number | string | undefined): string {
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
      return `${location.Dia_chi_cu_the}, ${location.Phuong_xa}, ${location.Quan_huyen}, ${location.Tinh_thanh}`;
    }
    return 'Chưa cập nhật';
  }
}
