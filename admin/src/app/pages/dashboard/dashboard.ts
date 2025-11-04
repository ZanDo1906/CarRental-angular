import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

interface CarRental {
  Ma_don_thue: number;
  Ma_nguoi_thue: number;
  Ma_xe: number;
  Ma_vi_tri_nhan: number;
  Ma_vi_tri_tra: number;
  Ngay_nhan_xe: string;
  Gio_nhan_xe: string;
  Ngay_tra_xe: string;
  Gio_tra_xe: string;
  Tong_ngay_thue: number;
  Tong_chi_phi: number;
  Trang_thai: number;
}

interface Car {
  Ma_xe: number;
  Ma_nguoi_dung: number;
  Hang_xe: string;
  Dong_xe: string;
  Tinh_trang_xe: string;
}

interface User {
  Ma_nguoi_dung: number;
  Ho_va_ten: string;
  So_dien_thoai: string;
  Email: string;
}

interface CarOwnerRevenue {
  Ma_nguoi_dung: number;
  Ho_va_ten: string;
  totalRevenue: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {
  @ViewChild('revenueChart', { static: false }) revenueChartRef!: ElementRef<HTMLCanvasElement>;

  carRentals: CarRental[] = [];
  cars: Car[] = [];
  users: User[] = [];

  // Statistics - Initialize with calculated values, will be updated with real data
  totalRevenue: number = 0;
  totalBookings: number = 0;
  totalCompletedBookings: number = 0;
  totalAvailableCars: number = 5;

  // Top 5 car owners with highest revenue
  topCarOwners: CarOwnerRevenue[] = [];

  // Flag to track if data has been loaded
  dataLoaded: boolean = false;
  carRentalsLoaded: boolean = false;
  carsLoaded: boolean = false;
  usersLoaded: boolean = false;

  // Chart
  revenueChart: Chart | null = null;

  // Filter
  selectedPeriod: string = 'all';

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    // Always start with "Tất cả thời gian"
    this.selectedPeriod = 'all';
    console.log('Dashboard initialized with period:', this.selectedPeriod);
    this.loadData();
  }



  ngAfterViewInit() {
    // View is ready, chart will be created after data loads
    console.log('📊 View initialized, waiting for data to create chart');
  }

  loadData() {
    // Load car rental data
    this.http.get<CarRental[]>('/assets/data/Car_rental.json').subscribe({
      next: (data) => {
        this.carRentals = data;
        this.carRentalsLoaded = true;
        console.log('✅ Car rental data loaded:', data.length, 'records');

        // Calculate statistics immediately after data is loaded
        this.calculateAllTimeStatistics();

        // Create chart after data is ready
        setTimeout(() => {
          this.createRevenueChart();
        }, 100);

        // Check if we can calculate top owners
        this.checkAndCalculateTopOwners();
      },
      error: (error) => {
        console.error('❌ Error loading car rental data:', error);
        this.dataLoaded = false;
      }
    });

    // Load car data for available cars count
    this.http.get<Car[]>('/assets/data/Car.json').subscribe(data => {
      this.cars = data;
      this.carsLoaded = true;
      this.calculateCarStatistics();
      console.log('Car data loaded:', data.length, 'cars');
      console.log('Available cars:', this.totalAvailableCars);
      
      // Check if we can calculate top owners
      this.checkAndCalculateTopOwners();
    });

    // Load user data for car owner names
    this.http.get<User[]>('/assets/data/User.json').subscribe(data => {
      this.users = data;
      this.usersLoaded = true;
      console.log('User data loaded:', data.length, 'users');
      
      // Check if we can calculate top owners
      this.checkAndCalculateTopOwners();
    });
  }

  calculateAllTimeStatistics() {
    if (this.carRentals.length > 0) {
      // Calculate ALL data for "Tất cả thời gian"
      this.totalRevenue = this.carRentals.reduce((sum, rental) => sum + rental.Tong_chi_phi, 0);
      this.totalBookings = this.carRentals.length;
      this.totalCompletedBookings = this.carRentals.filter(rental => rental.Trang_thai === 4).length;

      console.log('🔢 All time statistics calculated:', {
        totalRevenue: this.totalRevenue.toLocaleString('vi-VN'),
        totalBookings: this.totalBookings,
        totalCompleted: this.totalCompletedBookings,
        dataLength: this.carRentals.length
      });

      // Mark that data is ready and ensure the view updates immediately
      this.dataLoaded = true;
      // Run change detection immediately so the template shows updated values on first render
      try { this.cd.detectChanges(); } catch (e) { /* noop if detection isn't available */ }
    } else {
      console.log('❌ No car rental data available for calculation');
      this.dataLoaded = false;
    }
  }

  calculateStatistics() {
    if (this.selectedPeriod === 'all') {
      this.calculateAllTimeStatistics();
    } else {
      this.calculateFilteredStatistics();
    }
  }

  calculateCarStatistics() {
    if (this.cars.length > 0) {
      this.totalAvailableCars = this.cars.filter(car => car.Tinh_trang_xe === 'Còn trống').length;
      try { this.cd.detectChanges(); } catch (e) { }
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatRevenue(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  }

  onPeriodChange(event: any) {
    this.selectedPeriod = event.target.value;
    console.log('Selected period changed to:', this.selectedPeriod);

    if (this.selectedPeriod === 'all') {
      // If "Tất cả thời gian" is selected, recalculate all data
      this.calculateStatistics();
    } else {
      // For other periods, use filtered statistics
      this.calculateFilteredStatistics();
    }

    // Recreate chart with new data
    setTimeout(() => {
      this.createRevenueChart();
    }, 100);
  }

  calculateFilteredStatistics() {
    if (this.carRentals.length === 0) return;

    // If "all time" is selected, use all data
    if (this.selectedPeriod === 'all') {
      this.totalRevenue = this.carRentals.reduce((sum, rental) => sum + rental.Tong_chi_phi, 0);
      this.totalBookings = this.carRentals.length;
      this.totalCompletedBookings = this.carRentals.filter(rental => rental.Trang_thai === 4).length;

      console.log('All time statistics:', {
        revenue: this.totalRevenue,
        bookings: this.totalBookings,
        completed: this.totalCompletedBookings
      });
      return;
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    switch (this.selectedPeriod) {
      case 'week':
        // Tuần trước (7 ngày trước)
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now);
        break;
      case 'month':
        // Tháng trước
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'year':
        // Năm trước
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now);
    }

    // Filter rentals by date range
    const filteredRentals = this.carRentals.filter(rental => {
      const rentalDate = new Date(rental.Ngay_nhan_xe);
      return rentalDate >= startDate && rentalDate <= endDate;
    });

    // Calculate statistics for filtered data
    this.totalRevenue = filteredRentals.reduce((sum, rental) => sum + rental.Tong_chi_phi, 0);
    this.totalBookings = filteredRentals.length;
    this.totalCompletedBookings = filteredRentals.filter(rental => rental.Trang_thai === 4).length;

    // Ensure the UI reflects the newly calculated filtered stats immediately
    try { this.cd.detectChanges(); } catch (e) { }
    console.log(`Statistics for ${this.selectedPeriod}:`, {
      revenue: this.totalRevenue,
      bookings: this.totalBookings,
      completed: this.totalCompletedBookings,
      dateRange: { start: startDate, end: endDate }
    });
  }

  createRevenueChart() {
    if (!this.revenueChartRef?.nativeElement) {
      return;
    }

    // Process data to get weekly revenue
    const weeklyData = this.processWeeklyRevenue();

    const ctx = this.revenueChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    // Destroy existing chart if it exists
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }

    // Get appropriate labels and dataset labels based on period
    const chartConfig = this.getChartConfig();

    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartConfig.labels,
        datasets: [
          {
            label: chartConfig.currentLabel,
            data: weeklyData.currentWeek,
            borderColor: '#2C5F59',
            backgroundColor: 'rgba(44, 95, 89, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#2C5F59',
            pointBorderColor: '#2C5F59',
            pointRadius: 4,
          },
          {
            label: chartConfig.previousLabel,
            data: weeklyData.lastWeek,
            borderColor: '#B8D4D1',
            backgroundColor: 'rgba(184, 212, 209, 0.1)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            pointBackgroundColor: '#B8D4D1',
            pointBorderColor: '#B8D4D1',
            pointRadius: 3,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'start',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                family: 'Inter',
                size: 12,
                weight: 500
              }
            }
          },
          title: {
            display: true,
            text: 'Tổng doanh thu',
            align: 'start',
            font: {
              family: 'Inter',
              size: 16,
              weight: 600
            },
            padding: {
              bottom: 20
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return (Number(value) / 1000) + 'K';
              },
              font: {
                family: 'Inter',
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            ticks: {
              font: {
                family: 'Inter',
                size: 11
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  getChartConfig() {
    switch (this.selectedPeriod) {
      case 'all':
        return {
          labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
          currentLabel: 'Tất cả dữ liệu',
          previousLabel: 'Dữ liệu so sánh'
        };
      case 'week':
        return {
          labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
          currentLabel: 'Tuần hiện tại',
          previousLabel: 'Tuần trước'
        };
      case 'month':
        return {
          labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', '', '', ''],
          currentLabel: 'Tháng hiện tại',
          previousLabel: 'Tháng trước'
        };
      case 'year':
        return {
          labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
          currentLabel: 'Năm hiện tại',
          previousLabel: 'Năm trước'
        };
      default:
        return {
          labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
          currentLabel: 'Tuần hiện tại',
          previousLabel: 'Tuần trước'
        };
    }
  }

  processWeeklyRevenue() {
    // Generate different data based on selected period
    let currentData: number[];
    let previousData: number[];

    switch (this.selectedPeriod) {
      case 'all':
        // Summary data for all time
        currentData = [2500000, 2200000, 2800000, 2400000, 3200000, 2900000, 3100000];
        previousData = [2000000, 1800000, 2300000, 2000000, 2700000, 2400000, 2600000];
        break;
      case 'week':
        // Daily data for a week (T2-CN)
        currentData = [120000, 80000, 140000, 160000, 260000, 220000, 200000];
        previousData = [60000, 140000, 180000, 150000, 90000, 160000, 260000];
        break;
      case 'month':
        // Weekly data for a month (4 weeks)
        currentData = [500000, 400000, 600000, 550000, 0, 0, 0]; // Only 4 data points
        previousData = [300000, 450000, 700000, 400000, 0, 0, 0];
        break;
      case 'year':
        // Monthly data for a year (12 months, show only first 7)
        currentData = [2000000, 1800000, 2200000, 1900000, 2500000, 2100000, 2300000];
        previousData = [1500000, 1600000, 2000000, 1700000, 2100000, 1900000, 2000000];
        break;
      default:
        currentData = [120000, 80000, 140000, 160000, 260000, 220000, 200000];
        previousData = [60000, 140000, 180000, 150000, 90000, 160000, 260000];
    }

    return {
      currentWeek: currentData,
      lastWeek: previousData
    };
  }

  calculateTopCarOwners() {
    // Only calculate if all required data is loaded
    if (this.carRentals.length === 0 || this.cars.length === 0 || this.users.length === 0) {
      return;
    }

    console.log('🏆 Calculating top car owners...');

    // Create a map to accumulate revenue by car owner
    const ownerRevenueMap = new Map<number, number>();

    // Process each rental to accumulate revenue by car owner
    this.carRentals.forEach(rental => {
      // Find the car for this rental
      const car = this.cars.find(c => c.Ma_xe === rental.Ma_xe);
      if (car) {
        // Add revenue to the car owner
        const currentRevenue = ownerRevenueMap.get(car.Ma_nguoi_dung) || 0;
        ownerRevenueMap.set(car.Ma_nguoi_dung, currentRevenue + rental.Tong_chi_phi);
      }
    });

    // Convert to array and add owner names
    const ownerRevenueList: CarOwnerRevenue[] = [];
    ownerRevenueMap.forEach((revenue, ownerId) => {
      const user = this.users.find(u => u.Ma_nguoi_dung === ownerId);
      if (user) {
        ownerRevenueList.push({
          Ma_nguoi_dung: ownerId,
          Ho_va_ten: user.Ho_va_ten,
          totalRevenue: revenue
        });
      }
    });

    // Sort by revenue descending and take top 5
    this.topCarOwners = ownerRevenueList
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    console.log('🎯 Top 5 car owners calculated:', this.topCarOwners);

    // Trigger change detection
    try { 
      this.cd.detectChanges(); 
    } catch (e) { 
      console.log('Change detection not available'); 
    }
  }

  checkAndCalculateTopOwners() {
    // Only calculate when ALL three data sources are loaded
    if (this.carRentalsLoaded && this.carsLoaded && this.usersLoaded) {
      console.log('🔄 All data loaded, calculating top car owners...');
      this.calculateTopCarOwners();
    } else {
      console.log('⏳ Waiting for all data to load...', {
        carRentals: this.carRentalsLoaded,
        cars: this.carsLoaded,
        users: this.usersLoaded
      });
    }
  }
}
