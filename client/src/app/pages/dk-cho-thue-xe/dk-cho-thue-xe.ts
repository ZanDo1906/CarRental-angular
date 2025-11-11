import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  districts: District[];
}

interface District {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
  wards: any[];
}

@Component({
  selector: 'app-dk-cho-thue-xe',
  imports: [CommonModule, FormsModule],
  templateUrl: './dk-cho-thue-xe.html',
  styleUrl: './dk-cho-thue-xe.css',
})
export class DKChoThueXe implements OnInit {
  currentStep = 1;

  constructor(private http: HttpClient, private router: Router) { }

  // Step 1 data
  step1Data = {
    bienSo: '',
    hangXe: '',
    hangXeKhac: '',
    mauXe: '',
    loaiNhienLieu: '',
    soGhe: '',
    namSanXuat: '',
    truyenDong: '',
    loaiXe: '',
    loaiXeKhac: '',
    mauSac: '',
    mauSacKhac: '',
    nhieuLieu100km: '',
    moTa: ''
  };

  // Step 2 data
  step2Data = {
    giaChoThue: '',
    thanhPho: '',
    quanHuyen: '',
    tenDuong: '',
    soKm: ''
  };

  // Error tracking
  errors: any = {};

  // Dữ liệu từ JSON file
  provincesData: Province[] = [];
  provinces: string[] = [];
  currentDistricts: string[] = [];

  // Danh sách hãng xe có sẵn từ data
  availableCarBrands = ['Toyota', 'Hyundai', 'Mazda', 'Kia', 'Honda', 'Mitsubishi', 'Ford', 'VinFast', 'Isuzu'];

  // Regex cho biển số xe Việt Nam
  private readonly plateRegex = /^[0-9]{2}[A-Z]{1}-[0-9]{3}\.[0-9]{2}$/;

  // Image upload data
  licensePlateImage: string | null = null;
  vehicleDocumentsImage: string | null = null;
  ownerIDImage: string | null = null;
  carImages: (string | null)[] = [null, null, null, null];

  // Popup state
  showSuccessPopup: boolean = false;

  @ViewChild('licensePlateInput') licensePlateInput!: ElementRef<HTMLInputElement>;
  @ViewChild('vehicleDocumentsInput') vehicleDocumentsInput!: ElementRef<HTMLInputElement>;
  @ViewChild('ownerIDInput') ownerIDInput!: ElementRef<HTMLInputElement>;
  @ViewChild('car1Input') car1Input!: ElementRef<HTMLInputElement>;
  @ViewChild('car2Input') car2Input!: ElementRef<HTMLInputElement>;
  @ViewChild('car3Input') car3Input!: ElementRef<HTMLInputElement>;
  @ViewChild('car4Input') car4Input!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.loadProvincesData();
  }

  loadProvincesData(): void {
    this.http.get<Province[]>('/assets/data/tinh_thanh_day_du.json').subscribe({
      next: (data) => {
        this.provincesData = data;
        this.provinces = data.map(province => province.name);
      },
      error: (error) => {
        console.error('Error loading provinces data:', error);
      }
    });
  }

  validateStep1(): boolean {
    this.errors = {};
    let isValid = true;

    // Validate biển số xe
    if (!this.step1Data.bienSo.trim()) {
      this.errors.bienSo = true;
      isValid = false;
    } else if (!this.plateRegex.test(this.step1Data.bienSo.trim())) {
      this.errors.bienSo = true;
      isValid = false;
    }
    if (!this.step1Data.hangXe || this.step1Data.hangXe === '') {
      this.errors.hangXe = true;
      isValid = false;
    }
    // Nếu chọn "Khác" thì cần nhập hãng xe khác
    if (this.step1Data.hangXe === 'Khác' && !this.step1Data.hangXeKhac.trim()) {
      this.errors.hangXeKhac = true;
      isValid = false;
    }
    // Nếu chọn màu sắc "Khác" thì cần nhập màu sắc khác
    if (this.step1Data.mauSac === 'Khác' && !this.step1Data.mauSacKhac.trim()) {
      this.errors.mauSacKhac = true;
      isValid = false;
    }
    // Nếu chọn loại xe "Khác" thì cần nhập loại xe khác
    if (this.step1Data.loaiXe === 'Khác' && !this.step1Data.loaiXeKhac.trim()) {
      this.errors.loaiXeKhac = true;
      isValid = false;
    }
    if (!this.step1Data.mauXe.trim()) {
      this.errors.mauXe = true;
      isValid = false;
    }
    if (!this.step1Data.loaiNhienLieu || this.step1Data.loaiNhienLieu === '') {
      this.errors.loaiNhienLieu = true;
      isValid = false;
    }
    if (!this.step1Data.soGhe || this.step1Data.soGhe === '') {
      this.errors.soGhe = true;
      isValid = false;
    }
    // Validate năm sản xuất (phải là số 4 chữ số từ 1900 đến năm hiện tại + 1)
    const currentYear = new Date().getFullYear();
    const yearStr = this.step1Data.namSanXuat.toString();
    const year = parseInt(yearStr);
    if (!this.step1Data.namSanXuat ||
      isNaN(year) ||
      year < 1900 ||
      year > currentYear + 1 ||
      yearStr.length !== 4) {
      this.errors.namSanXuat = true;
      isValid = false;
    }
    if (!this.step1Data.truyenDong || this.step1Data.truyenDong === '') {
      this.errors.truyenDong = true;
      isValid = false;
    }
    if (!this.step1Data.loaiXe || this.step1Data.loaiXe === '') {
      this.errors.loaiXe = true;
      isValid = false;
    }
    if (!this.step1Data.mauSac || this.step1Data.mauSac === '') {
      this.errors.mauSac = true;
      isValid = false;
    }
    if (!this.step1Data.nhieuLieu100km.trim()) {
      this.errors.nhieuLieu100km = true;
      isValid = false;
    }

    return isValid;
  }

  validateStep2(): boolean {
    this.errors = {};
    let isValid = true;

    // Validate giá cho thuê
    if (!this.step2Data.giaChoThue.trim()) {
      this.errors.giaChoThue = true;
      isValid = false;
    } else {
      // Check if price is valid number (remove dots for validation)
      const priceNumber = parseInt(this.step2Data.giaChoThue.replace(/\./g, ''));
      if (isNaN(priceNumber) || priceNumber <= 0) {
        this.errors.giaChoThue = true;
        isValid = false;
      }
    }
    if (!this.step2Data.thanhPho || this.step2Data.thanhPho === '') {
      this.errors.thanhPho = true;
      isValid = false;
    }
    if (!this.step2Data.quanHuyen || this.step2Data.quanHuyen === '') {
      this.errors.quanHuyen = true;
      isValid = false;
    }
    if (!this.step2Data.tenDuong.trim()) {
      this.errors.tenDuong = true;
      isValid = false;
    }
    if (!this.step2Data.soKm.trim()) {
      this.errors.soKm = true;
      isValid = false;
    }

    return isValid;
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      console.log('Step 1 data:', this.step1Data);
      console.log('Validation result:', this.validateStep1());
      console.log('Errors:', this.errors);
      if (this.validateStep1()) {
        this.currentStep = 2;
      }
    } else if (this.currentStep === 2 && this.validateStep2()) {
      this.currentStep = 3;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errors = {};
    }
  }

  setSuggestedPrice(price: number): void {
    this.step2Data.giaChoThue = this.formatNumber(price);
  }

  formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  onPriceInput(event: any): void {
    let value = event.target.value.replace(/\./g, ''); // Remove existing dots
    if (value && !isNaN(value)) {
      const formatted = this.formatNumber(parseInt(value));
      this.step2Data.giaChoThue = formatted;
    }
    // Clear error if exists
    if (this.errors.giaChoThue) {
      delete this.errors.giaChoThue;
    }
  }

  onProvinceChange(): void {
    const selectedProvince = this.provincesData.find(province => province.name === this.step2Data.thanhPho);
    if (selectedProvince) {
      this.currentDistricts = selectedProvince.districts.map(district => district.name);
    } else {
      this.currentDistricts = [];
    }
    this.step2Data.quanHuyen = ''; // Reset quận huyện khi đổi tỉnh
  }

  onCarBrandChange(): void {
    // Reset hãng xe khác khi không chọn "Khác"
    if (this.step1Data.hangXe !== 'Khác') {
      this.step1Data.hangXeKhac = '';
    }
    // Xóa lỗi khi có thay đổi
    if (this.errors.hangXe) {
      delete this.errors.hangXe;
    }
    if (this.errors.hangXeKhac) {
      delete this.errors.hangXeKhac;
    }
  }

  onCarColorChange(): void {
    // Reset màu sắc khác khi không chọn "Khác"
    if (this.step1Data.mauSac !== 'Khác') {
      this.step1Data.mauSacKhac = '';
    }
    // Xóa lỗi khi có thay đổi
    if (this.errors.mauSac) {
      delete this.errors.mauSac;
    }
    if (this.errors.mauSacKhac) {
      delete this.errors.mauSacKhac;
    }
  }

  onCarTypeChange(): void {
    // Reset loại xe khác khi không chọn "Khác"
    if (this.step1Data.loaiXe !== 'Khác') {
      this.step1Data.loaiXeKhac = '';
    }
    // Xóa lỗi khi có thay đổi
    if (this.errors.loaiXe) {
      delete this.errors.loaiXe;
    }
    if (this.errors.loaiXeKhac) {
      delete this.errors.loaiXeKhac;
    }
  }

  onYearChange(): void {
    // Xóa lỗi khi có thay đổi
    if (this.errors.namSanXuat) {
      delete this.errors.namSanXuat;
    }

    // Đảm bảo chỉ nhập tối đa 4 chữ số
    if (this.step1Data.namSanXuat.length > 4) {
      this.step1Data.namSanXuat = this.step1Data.namSanXuat.slice(0, 4);
    }
  }

  onLicensePlateChange(): void {
    // Xóa lỗi khi có thay đổi
    if (this.errors.bienSo) {
      delete this.errors.bienSo;
    }

    // Chuyển đổi thành chữ hoa và format
    let value = this.step1Data.bienSo.toUpperCase();

    // Loại bỏ các ký tự không hợp lệ
    value = value.replace(/[^0-9A-Z\-\.]/g, '');

    // Auto format: thêm dấu - và . nếu cần
    if (value.length >= 3 && !value.includes('-')) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    }
    if (value.length >= 7 && value.split('.').length === 1) {
      const parts = value.split('-');
      if (parts.length === 2 && parts[1].length >= 3) {
        value = parts[0] + '-' + parts[1].slice(0, 3) + '.' + parts[1].slice(3);
      }
    }

    // Giới hạn độ dài
    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    this.step1Data.bienSo = value;
  }

  // Helper method để kiểm tra biển số hợp lệ
  isValidLicensePlate(plate: string): boolean {
    return this.plateRegex.test(plate.trim());
  }

  triggerFileInput(type: string): void {
    switch (type) {
      case 'licensePlate':
        this.licensePlateInput?.nativeElement.click();
        break;
      case 'vehicleDocuments':
        this.vehicleDocumentsInput?.nativeElement.click();
        break;
      case 'ownerID':
        this.ownerIDInput?.nativeElement.click();
        break;
      case 'car1':
        this.car1Input?.nativeElement.click();
        break;
      case 'car2':
        this.car2Input?.nativeElement.click();
        break;
      case 'car3':
        this.car3Input?.nativeElement.click();
        break;
      case 'car4':
        this.car4Input?.nativeElement.click();
        break;
    }
  }

  onImageSelected(event: any, type: string): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageUrl = e.target.result;

        switch (type) {
          case 'licensePlate':
            this.licensePlateImage = imageUrl;
            break;
          case 'vehicleDocuments':
            this.vehicleDocumentsImage = imageUrl;
            break;
          case 'ownerID':
            this.ownerIDImage = imageUrl;
            break;
          case 'car1':
            this.carImages[0] = imageUrl;
            break;
          case 'car2':
            this.carImages[1] = imageUrl;
            break;
          case 'car3':
            this.carImages[2] = imageUrl;
            break;
          case 'car4':
            this.carImages[3] = imageUrl;
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  validateStep3(): boolean {
    // Có thể thêm validation cho step 3 ở đây nếu cần
    // Ví dụ: kiểm tra có ít nhất 1 ảnh xe được upload
    return true;
  }

  onSubmit(): void {
    if (this.currentStep === 3) {
      if (this.validateStep3()) {
        // Log all data to console (có thể gửi lên server ở đây)
        console.log('=== ĐĂNG KÝ XE HOÀN THÀNH ===');
        console.log('Step 1 Data:', this.step1Data);
        console.log('Step 2 Data:', this.step2Data);
        console.log('Images:', {
          licensePlate: this.licensePlateImage,
          vehicleDocuments: this.vehicleDocumentsImage,
          ownerID: this.ownerIDImage,
          carImages: this.carImages
        });
        
        // Hiển thị popup thành công
        this.showSuccessPopup = true;
      }
    }
  }

  closeSuccessPopup(): void {
    this.showSuccessPopup = false;
    // Navigate về trang chủ
    this.router.navigate(['/']);
  }
}
