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
  minDateTime: string = '';

  // Cars data
  cars: iCar[] = [];
  displayedCars: iCar[] = [];
  locations: any[] = [];

  faq1Open: boolean = false;
  faq2Open: boolean = false;
  faq3Open: boolean = false;
  faq4Open: boolean = false;
  faq5Open: boolean = false;
  faq6Open: boolean = false;
  faq7Open: boolean = false;
  faq8Open: boolean = false;
  faq9Open: boolean = false;
  //First
  constructor(
    private el: ElementRef,
    private router: Router,
    private bookingDataService: BookingDataService,
    private carService: CarService,
    private locationService: LocationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Set min datetime to current time
    this.setMinDateTime();
    // Load locations trước
    this.loadLocations();
    // Sau đó load cars
    this.loadCars();
  }

  private setMinDateTime(): void {
    const now = new Date();
    // Format to YYYY-MM-DDTHH:mm for datetime-local input
    this.minDateTime = now.toISOString().slice(0, 16);
  }

  ngAfterViewInit(): void {
    this.startCounter();
    this.setupSecondAnimation();
    this.setupThirthAnimation();
    this.setupQuestionsAnimation();
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

  // Hàm  xử lý animation .second
  private setupSecondAnimation(): void {
    const containers = this.el.nativeElement.querySelectorAll('.second');

    if (containers.length === 0) {
      console.error('Không tìm thấy phần tử .second');
      return;
    }

    containers.forEach((container: HTMLElement) => {
      const img = container.querySelector('img');
      const content = container.querySelector('.second-content');

      if (!img || !content) {
        console.error('Không tìm thấy img hoặc .second-content trong container');
        return;
      }

      const slideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            img.classList.add('animate-left');
            content.classList.add('animate-right');
          } else {
            img.classList.remove('animate-left');
            content.classList.remove('animate-right');
          }
        });
      }, {
        threshold: 0.2
      });

      slideObserver.observe(container);
    });
  }

  // Hàm  xử lý animation .thirth
  private setupThirthAnimation(): void {
    const img = this.el.nativeElement.querySelector('.thirth img');
    const content = this.el.nativeElement.querySelector('.thirth-content');
    const container = this.el.nativeElement.querySelector('.thirth');

    if (!img || !content || !container) {
      console.error('Không tìm thấy phần tử .thirth, img, hoặc .thirth-content');
      return;
    }

    const slideObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.classList.add('animate-left');
          content.classList.add('animate-right');
        } else {
          img.classList.remove('animate-left');
          content.classList.remove('animate-right');
        }
      });
    }, {
      threshold: 0.2
    });

    slideObserver.observe(container);
  }
  // Hàm  xử lý animation .questions
  private setupQuestionsAnimation(): void {
    const container = this.el.nativeElement.querySelector('.questions');

    if (!container) { 
      console.error('Không tìm thấy phần tử .questions để "animate"');
      return; 
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                container.classList.add('animate-fade-up');
            } else {
                container.classList.remove('animate-fade-up');
            }
        });
    }, { threshold: 0.2 });

    observer.observe(container);
  }



  goToOwnerPage() {
    this.router.navigate(['/owner']);
  }

  goToAboutTrustcar() {
    this.router.navigate(['/ve-trust-car']);
  }

  goToLienHe() {
    this.router.navigate(['/lien-he']);
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
