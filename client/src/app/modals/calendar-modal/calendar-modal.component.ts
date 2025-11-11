import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarRental } from '../../services/car-rental';
import { BlockedDateService } from '../../services/blocked-date.service';
import { BlockedDate } from '../../interfaces/BlockedDate';

@Component({
  selector: 'app-calendar-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-modal.component.html',
  styleUrls: ['./calendar-modal.component.css']
})
export class CalendarModalComponent implements OnInit, OnChanges {
  @Input() show: boolean = false;
  @Input() selectedCar: any = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() dayClicked = new EventEmitter<any>();
  @Output() blockedDateRemoved = new EventEmitter<any>();

  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  calendarDays: any[] = [];
  rentals: any[] = [];
  occupiedDates: Set<string> = new Set();
  blockedDates: BlockedDate[] = [];
  blockedDateSet: Set<string> = new Set();

  constructor(
    private carRentalService: CarRental,
    private blockedDateService: BlockedDateService
  ) {}

  ngOnInit() {
    this.generateCalendar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && changes['show'].currentValue && this.selectedCar) {
      this.loadRentalData();
    }
  }

  vnd(n: number | string | undefined) {
    if (n == null) return '';
    const x = typeof n === 'number' ? n : Number(n);
    return x.toLocaleString('vi-VN');
  }

  close() {
    this.closeModal.emit();
  }

  // Load dữ liệu thuê xe và ngày bị chặn
  loadRentalData() {
    if (!this.selectedCar) return;

    // Load rental data
    this.carRentalService.getAllCars().subscribe((rentals: any[]) => {
      const carRentals = rentals.filter(r => 
        Number(r.Ma_xe) === Number(this.selectedCar.Ma_xe) &&
        r.Trang_thai !== 0 && r.Trang_thai !== 5
      );

      this.rentals = carRentals;
      this.calculateOccupiedDates();
      this.loadBlockedDates();
    });
  }

  // Load blocked dates
  loadBlockedDates() {
    if (!this.selectedCar) return;

    this.blockedDateService.getBlockedDatesForCar(this.selectedCar.Ma_xe).subscribe(dates => {
      this.blockedDates = dates;
      this.calculateBlockedDates();
      this.generateCalendar();
    });
  }

  // Tính toán các ngày đã được thuê
  calculateOccupiedDates() {
    this.occupiedDates.clear();

    this.rentals.forEach(rental => {
      const startDate = new Date(rental.Ngay_nhan_xe);
      const endDate = new Date(rental.Ngay_tra_xe);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = this.formatDate(d);
        this.occupiedDates.add(dateStr);
      }
    });
  }

  // Tính toán các ngày bị chặn
  calculateBlockedDates() {
    this.blockedDateSet.clear();

    this.blockedDates.forEach(blocked => {
      const startDate = new Date(blocked.Ngay_bat_dau);
      const endDate = new Date(blocked.Ngay_ket_thuc);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = this.formatDate(d);
        this.blockedDateSet.add(dateStr);
      }
    });
  }

  // Format ngày theo định dạng YYYY-MM-DD
  formatDate(date: Date): string {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  }

  // Tạo lịch cho tháng hiện tại
  generateCalendar() {
    this.calendarDays = [];
    
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    
    startDate.setDate(startDate.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateStr = this.formatDate(currentDate);
      const isCurrentMonth = currentDate.getMonth() === this.currentMonth;
      const isOccupied = this.occupiedDates.has(dateStr);
      const isBlocked = this.blockedDateSet.has(dateStr);
      const isToday = this.formatDate(today) === dateStr;
      const isPast = currentDate < today;
      const isFutureAvailable = isCurrentMonth && !isPast && !isOccupied && !isBlocked && !isToday;
      const isInteractable = !isPast || isOccupied || isBlocked;

      this.calendarDays.push({
        date: currentDate,
        dateStr: dateStr,
        day: currentDate.getDate(),
        isCurrentMonth: isCurrentMonth,
        isOccupied: isOccupied,
        isBlocked: isBlocked,
        isToday: isToday,
        isPast: isPast,
        isFutureAvailable: isFutureAvailable,
        isInteractable: isInteractable
      });
    }
  }

  // Chuyển tháng trước
  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  // Chuyển tháng sau
  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  // Lấy tên tháng
  getMonthName(): string {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return months[this.currentMonth];
  }

  // Lấy thông tin đơn thuê
  getRentalInfo(dateStr: string): string {
    const rentalsForDate = this.rentals.filter(rental => {
      const startDate = new Date(rental.Ngay_nhan_xe);
      const endDate = new Date(rental.Ngay_tra_xe);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate;
    });

    if (rentalsForDate.length > 0) {
      const rental = rentalsForDate[0];
      return `Thuê từ ${rental.Ngay_nhan_xe} đến ${rental.Ngay_tra_xe}`;
    }
    return '';
  }

  // Lấy thông tin blocked date
  getBlockedInfo(dateStr: string): string {
    const blocked = this.blockedDates.find(b => {
      const startDate = new Date(b.Ngay_bat_dau);
      const endDate = new Date(b.Ngay_ket_thuc);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate;
    });

    if (blocked) {
      return blocked.Ly_do || `${blocked.Ngay_bat_dau} - ${blocked.Ngay_ket_thuc}`;
    }
    return '';
  }

  // Lấy tooltip text
  getTooltipText(day: any): string {
    if (!day.isCurrentMonth) return '';
    
    if (day.isOccupied) {
      return this.getRentalInfo(day.dateStr);
    }
    
    if (day.isBlocked) {
      const blockedInfo = this.getBlockedInfo(day.dateStr);
      return blockedInfo ? `Đã chặn: ${blockedInfo}` : 'Đã chặn bởi chủ xe';
    }
    
    if (day.isToday) {
      return 'Hôm nay' + (day.isOccupied ? '' : ' - Có thể thuê');
    }
    
    if (day.isPast) {
      return 'Ngày đã qua';
    }
    
    if (day.isFutureAvailable) {
      return 'Ngày rảnh - Click để chặn';
    }
    
    return '';
  }

  // Click vào ngày
  onDayClick(day: any) {
    if (day.isFutureAvailable) {
      this.dayClicked.emit(day);
    } else if (day.isBlocked) {
      this.removeBlockedDate(day);
    }
  }

  // Xóa blocked date
  removeBlockedDate(day: any) {
    if (!day.isBlocked) return;

    const blocked = this.blockedDates.find(b => {
      const startDate = new Date(b.Ngay_bat_dau);
      const endDate = new Date(b.Ngay_ket_thuc);
      const checkDate = new Date(day.dateStr);
      return checkDate >= startDate && checkDate <= endDate;
    });

    if (blocked) {
      this.blockedDateRemoved.emit(blocked);
    }
  }

  // Tính tổng doanh thu
  getTotalRevenue(): string {
    const total = this.rentals.reduce((sum, rental) => sum + (rental.Tong_chi_phi || 0), 0);
    return this.vnd(total);
  }
}
