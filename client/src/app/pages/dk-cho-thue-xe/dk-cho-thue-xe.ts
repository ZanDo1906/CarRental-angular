import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) { }

  // Step 1 data
  step1Data = {
    bienSo: '',
    hangXe: '',
    mauXe: '',
    loaiNhienLieu: '',
    soGhe: '',
    namSanXuat: '',
    truyenDong: '',
    loaiXe: '',
    mauSac: '',
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

  // Image upload data
  thumbnailImage: string | null = null;
  mainImage: string | null = null;
  subImages: (string | null)[] = [null, null, null, null];

  @ViewChild('thumbnailInput') thumbnailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('mainInput') mainInput!: ElementRef<HTMLInputElement>;
  @ViewChild('sub1Input') sub1Input!: ElementRef<HTMLInputElement>;
  @ViewChild('sub2Input') sub2Input!: ElementRef<HTMLInputElement>;
  @ViewChild('sub3Input') sub3Input!: ElementRef<HTMLInputElement>;
  @ViewChild('sub4Input') sub4Input!: ElementRef<HTMLInputElement>;

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

    // Check required fields
    if (!this.step1Data.bienSo.trim()) {
      this.errors.bienSo = true;
      isValid = false;
    }
    if (!this.step1Data.hangXe.trim()) {
      this.errors.hangXe = true;
      isValid = false;
    }
    if (!this.step1Data.mauXe.trim()) {
      this.errors.mauXe = true;
      isValid = false;
    }
    if (!this.step1Data.loaiNhienLieu || this.step1Data.loaiNhienLieu.startsWith('--')) {
      this.errors.loaiNhienLieu = true;
      isValid = false;
    }
    if (!this.step1Data.soGhe || this.step1Data.soGhe.startsWith('--')) {
      this.errors.soGhe = true;
      isValid = false;
    }
    if (!this.step1Data.namSanXuat || this.step1Data.namSanXuat.startsWith('--')) {
      this.errors.namSanXuat = true;
      isValid = false;
    }
    if (!this.step1Data.truyenDong || this.step1Data.truyenDong.startsWith('--')) {
      this.errors.truyenDong = true;
      isValid = false;
    }
    if (!this.step1Data.loaiXe || this.step1Data.loaiXe.startsWith('--')) {
      this.errors.loaiXe = true;
      isValid = false;
    }
    if (!this.step1Data.mauSac || this.step1Data.mauSac.startsWith('--')) {
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

    if (!this.step2Data.giaChoThue.trim()) {
      this.errors.giaChoThue = true;
      isValid = false;
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
    if (this.currentStep === 1 && this.validateStep1()) {
      this.currentStep = 2;
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
    this.step2Data.giaChoThue = price.toString();
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

  triggerFileInput(type: string): void {
    switch (type) {
      case 'thumbnail':
        this.thumbnailInput?.nativeElement.click();
        break;
      case 'main':
        this.mainInput?.nativeElement.click();
        break;
      case 'sub1':
        this.sub1Input?.nativeElement.click();
        break;
      case 'sub2':
        this.sub2Input?.nativeElement.click();
        break;
      case 'sub3':
        this.sub3Input?.nativeElement.click();
        break;
      case 'sub4':
        this.sub4Input?.nativeElement.click();
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
          case 'thumbnail':
            this.thumbnailImage = imageUrl;
            break;
          case 'main':
            this.mainImage = imageUrl;
            break;
          case 'sub1':
            this.subImages[0] = imageUrl;
            break;
          case 'sub2':
            this.subImages[1] = imageUrl;
            break;
          case 'sub3':
            this.subImages[2] = imageUrl;
            break;
          case 'sub4':
            this.subImages[3] = imageUrl;
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  }
}
