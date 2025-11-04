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
  Loai_xe: string;
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
  @ViewChild('statusChart', { static: false }) statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('vehicleTypeChart', { static: false }) vehicleTypeChartRef!: ElementRef<HTMLCanvasElement>;

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

  // Charts
  revenueChart: Chart | null = null;
  statusChart: Chart | null = null;
  vehicleTypeChart: Chart | null = null;

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

        // Create charts after data is ready
        setTimeout(() => {
          this.createRevenueChart();
          this.createStatusChart();
          this.createVehicleTypeChart();
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

      // Calculate top car owners for all time
      this.calculateTopCarOwners();

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

    // Recreate charts with new data
    setTimeout(() => {
      this.createRevenueChart();
      this.createStatusChart();
      this.createVehicleTypeChart();
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
        // Tuần này (từ thứ 2 đến hiện tại)
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
        const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Chủ nhật = 0, cần chuyển thành 6
        startOfWeek.setDate(now.getDate() - daysSinceMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        endDate = new Date(now);
        break;
      case 'month':
        // Tháng này (từ đầu tháng đến hiện tại)
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
        break;
      case 'year':
        // Năm này (từ đầu năm đến hiện tại)
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now);
    }

    // Filter rentals by date range (using return date for revenue recognition)
    const filteredRentals = this.carRentals.filter(rental => {
      const returnDate = new Date(rental.Ngay_tra_xe);
      return returnDate >= startDate && returnDate <= endDate;
    });

    // Calculate statistics for filtered data
    this.totalRevenue = filteredRentals.reduce((sum, rental) => sum + rental.Tong_chi_phi, 0);
    this.totalBookings = filteredRentals.length;
    this.totalCompletedBookings = filteredRentals.filter(rental => rental.Trang_thai === 4).length;

    // Calculate top car owners for filtered period
    this.calculateTopCarOwners();

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
                return (Number(value) / 1000000).toFixed(1) + 'tr';
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

  createStatusChart() {
    if (!this.statusChartRef?.nativeElement) {
      return;
    }

    const ctx = this.statusChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    // Destroy existing chart if it exists
    if (this.statusChart) {
      this.statusChart.destroy();
    }

    // Get rental status data
    const statusData = this.getStatusData();

    this.statusChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Đang chờ duyệt', 'Đang thực hiện', 'Đã hoàn thành', 'Đã hủy'],
        datasets: [{
          label: 'Số đơn',
          data: statusData,
          backgroundColor: [
            '#60A5FA', // Blue for pending
            '#34D399', // Green for in progress  
            '#1F2937', // Dark for completed
            '#60A5FA'  // Blue for cancelled
          ],
          borderRadius: 8,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Tình trạng đơn đặt xe',
            font: {
              family: 'Montserrat',
              size: 16,
              weight: 700
            },
            color: '#1F2937',
            padding: {
              bottom: 20
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
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

  createVehicleTypeChart() {
    if (!this.vehicleTypeChartRef?.nativeElement) {
      return;
    }

    const ctx = this.vehicleTypeChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    // Destroy existing chart if it exists
    if (this.vehicleTypeChart) {
      this.vehicleTypeChart.destroy();
    }

    // Get vehicle type data
    const vehicleTypeData = this.getVehicleTypeData();

    // Map colors for each vehicle type
    const colors = vehicleTypeData.labels.map(label => this.getVehicleTypeColor(label));

    this.vehicleTypeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: vehicleTypeData.labels,
        datasets: [{
          data: vehicleTypeData.values,
          backgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                family: 'Inter',
                size: 12
              },
              padding: 15,
              generateLabels: function (chart) {
                const data = chart.data;
                if (data.labels && data.datasets.length > 0) {
                  return data.labels.map((label, i) => {
                    const dataset = data.datasets[0];
                    const value = dataset.data[i] as number;
                    const total = (dataset.data as number[]).reduce((sum, val) => sum + val, 0);
                    const percentage = ((value / total) * 100).toFixed(1);

                    const backgroundColor = dataset.backgroundColor as string[];

                    return {
                      text: `${label} - ${percentage}%`,
                      fillStyle: backgroundColor?.[i] || '#000',
                      strokeStyle: backgroundColor?.[i] || '#000',
                      lineWidth: 0,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          title: {
            display: true,
            text: 'Tỷ lệ đặt xe theo loại xe',
            font: {
              family: 'Montserrat',
              size: 16,
              weight: 700
            },
            color: '#1F2937',
            padding: {
              bottom: 20
            }
          }
        }
      }
    });
  }

  getDateRangeForPeriod(): { startDate: Date, endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    switch (this.selectedPeriod) {
      case 'week':
        // Tuần này (từ thứ 2 đến hiện tại)
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
        const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(now.getDate() - daysSinceMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        break;
      case 'month':
        // Tháng này (từ đầu tháng đến hiện tại)
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        // Năm này (từ đầu năm đến hiện tại)
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        const defaultStartOfWeek = new Date(now);
        const defaultDayOfWeek = now.getDay();
        const defaultDaysSinceMonday = defaultDayOfWeek === 0 ? 6 : defaultDayOfWeek - 1;
        defaultStartOfWeek.setDate(now.getDate() - defaultDaysSinceMonday);
        defaultStartOfWeek.setHours(0, 0, 0, 0);
        startDate = defaultStartOfWeek;
    }

    return { startDate, endDate };
  }

  getStatusData(): number[] {
    // Filter rentals based on current period
    let filteredRentals = this.carRentals;

    if (this.selectedPeriod !== 'all') {
      const { startDate, endDate } = this.getDateRangeForPeriod();

      filteredRentals = this.carRentals.filter(rental => {
        const returnDate = new Date(rental.Ngay_tra_xe);
        return returnDate >= startDate && returnDate <= endDate;
      });
    }

    // Count by status (Trang_thai: 1=pending, 2=in progress, 4=completed, 0=cancelled)
    const pending = filteredRentals.filter(rental => rental.Trang_thai === 1).length;
    const inProgress = filteredRentals.filter(rental => rental.Trang_thai === 2).length;
    const completed = filteredRentals.filter(rental => rental.Trang_thai === 4).length;
    const cancelled = filteredRentals.filter(rental => rental.Trang_thai === 0).length;

    return [pending, inProgress, completed, cancelled];
  }

  getVehicleTypeData(): { labels: string[], values: number[] } {
    // Filter rentals based on current period
    let filteredRentals = this.carRentals;

    if (this.selectedPeriod !== 'all') {
      const { startDate, endDate } = this.getDateRangeForPeriod();

      filteredRentals = this.carRentals.filter(rental => {
        const returnDate = new Date(rental.Ngay_tra_xe);
        return returnDate >= startDate && returnDate <= endDate;
      });
    }

    // Count vehicle types using Loai_xe field
    const vehicleTypeCounts = new Map<string, number>();

    filteredRentals.forEach(rental => {
      const car = this.cars.find(c => c.Ma_xe === rental.Ma_xe);
      if (car && car.Loai_xe) {
        // Use the Loai_xe field directly
        const vehicleType = car.Loai_xe;
        vehicleTypeCounts.set(vehicleType, (vehicleTypeCounts.get(vehicleType) || 0) + 1);
      }
    });

    const labels: string[] = [];
    const values: number[] = [];

    vehicleTypeCounts.forEach((count, type) => {
      labels.push(type);
      values.push(count);
    });

    return { labels, values };
  }

  getVehicleTypeColor(vehicleType: string): string {
    // Define colors for each vehicle type
    const colorMap: { [key: string]: string } = {
      'Sedan': '#1F2937',      // Dark gray
      'SUV/CUV': '#60A5FA',    // Blue  
      'Hatchback': '#34D399',  // Green
      'MPV': '#F59E0B',        // Orange
      'Bán tải': '#EF4444'     // Red
    };

    return colorMap[vehicleType] || '#A78BFA'; // Purple for unknown types
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
          labels: ['1-4', '5-8', '9-12', '13-16', '17-20', '21-24', '25-31'],
          currentLabel: 'Tháng hiện tại',
          previousLabel: 'Tháng trước'
        };
      case 'year':
        return {
          labels: ['T1-T2', 'T3-T4', 'T5-T6', 'T7-T8', 'T9-T10', 'T11-T12', 'Khác'],
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
    // Use real data from database instead of fake data
    if (this.selectedPeriod === 'all') {
      // For "all time", show data across all available data
      return this.calculateAllTimeChartData();
    }

    const { startDate, endDate } = this.getDateRangeForPeriod();

    // Get current period data
    const currentPeriodData = this.calculateRealChartData(startDate, endDate);

    // Calculate previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(startDate.getTime());
    const previousPeriodData = this.calculateRealChartData(previousStartDate, previousEndDate);

    return {
      currentWeek: currentPeriodData,
      lastWeek: previousPeriodData
    };
  }

  calculateAllTimeChartData(): { currentWeek: number[], lastWeek: number[] } {
    if (this.carRentals.length === 0) {
      return {
        currentWeek: [0, 0, 0, 0, 0, 0, 0],
        lastWeek: [0, 0, 0, 0, 0, 0, 0]
      };
    }

    // Find date range of all data
    const allDates = this.carRentals.map(r => new Date(r.Ngay_tra_xe).getTime());
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    // Split into two periods for comparison
    const totalPeriod = maxDate.getTime() - minDate.getTime();
    const midPoint = new Date(minDate.getTime() + totalPeriod / 2);

    const earlierData = this.calculateRealChartData(minDate, midPoint);
    const laterData = this.calculateRealChartData(midPoint, maxDate);

    return {
      currentWeek: laterData,
      lastWeek: earlierData
    };
  }

  calculateRealChartData(startDate: Date, endDate: Date): number[] {
    // Filter rentals for the period (using return date)
    const filteredRentals = this.carRentals.filter(rental => {
      const returnDate = new Date(rental.Ngay_tra_xe);
      return returnDate >= startDate && returnDate <= endDate;
    });

    // Initialize array with 7 periods (all zeros)
    const revenueData = [0, 0, 0, 0, 0, 0, 0];

    if (filteredRentals.length === 0) {
      return revenueData;
    }

    // Calculate period length and divide into 7 segments
    const totalPeriodMs = endDate.getTime() - startDate.getTime();
    const segmentMs = totalPeriodMs / 7;

    // Distribute revenue across the 7 segments based on return dates
    filteredRentals.forEach(rental => {
      const returnDate = new Date(rental.Ngay_tra_xe);
      const timeFromStart = returnDate.getTime() - startDate.getTime();
      const segmentIndex = Math.min(6, Math.floor(timeFromStart / segmentMs));

      revenueData[segmentIndex] += rental.Tong_chi_phi;
    });

    return revenueData;
  }



  calculateTopCarOwners() {
    // Only calculate if all required data is loaded
    if (this.carRentals.length === 0 || this.cars.length === 0 || this.users.length === 0) {
      return;
    }

    console.log('🏆 Calculating top car owners for period:', this.selectedPeriod);

    // Filter rentals by selected period (same logic as calculateFilteredStatistics)
    let filteredRentals = this.carRentals;

    if (this.selectedPeriod !== 'all') {
      const { startDate, endDate } = this.getDateRangeForPeriod();

      // Filter rentals by date range (using return date for revenue recognition)
      filteredRentals = this.carRentals.filter(rental => {
        const returnDate = new Date(rental.Ngay_tra_xe);
        return returnDate >= startDate && returnDate <= endDate;
      });

      console.log(`📅 Filtered rentals for ${this.selectedPeriod}:`, filteredRentals.length, 'records');
    }

    // Create a map to accumulate revenue by car owner
    const ownerRevenueMap = new Map<number, number>();

    // Process each filtered rental to accumulate revenue by car owner
    filteredRentals.forEach(rental => {
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
