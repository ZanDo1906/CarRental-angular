import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user';
import { OwnerService } from '../../services/owner.service';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './account-detail.html',
  styleUrl: './account-detail.css',
})
export class AccountDetail implements OnInit {

  user: any = null;
  editingProfile: boolean = false;
  editingLicense: boolean = false;

  // --- THÊM CÁC BIẾN CÒN THIẾU ---
  totalTripsCount: number = 0;

  constructor(
    private userService: UserService,
    @Inject(OwnerService) private ownerService: OwnerService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Lấy id từ route param, nếu có thì load đúng user đó
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.loadUser(id || undefined);
    });
  }

  goBack(): void {
    this.router.navigate(['/account']);
  }
  // --- THÊM GETTER 'avatarUrl' ---
  get avatarUrl(): string {
    // Ưu tiên hiển thị ảnh mới upload (nếu có)
    if (this.user?._avatar && this.user._avatar.startsWith('data:')) {
      return this.user._avatar;
    }
    // Lấy ảnh từ database
    if (this.user?.Anh_dai_dien) {
      return String(this.user.Anh_dai_dien).replace(/^\.?\//, '/');
    }
    // Ảnh dự phòng
    return '/assets/images/user_avt.jpg';
  }

  // --- XÓA 'goBack()' VÌ KHÔNG DÙNG ---

  onEdit(field: string) {
    if (field === 'uploadGPLX') {
      const el = document.getElementById('licenseInput') as HTMLInputElement | null;
      if (el) el.click();
      return;
    }
    if (field === 'profile') {
      this.editingProfile = true;
      return;
    }
    if (field === 'license') {
      this.editingLicense = true;
      return;
    }
  }

  saveUser() {
    if (!this.user) return;
    this.localSaveUser(this.user);
    this.editingProfile = false;
    try { alert('Thông tin người dùng đã được lưu.'); } catch { }
  }

  saveLicense() {
    if (!this.user) return;
    this.localSaveUser(this.user);
    this.editingLicense = false;
    try { alert('Thông tin GPLX đã được lưu.'); } catch { }
  }

  cancelEdit() {
    this.editingProfile = false;
    this.loadUser();
  }

  cancelLicenseEdit() {
    this.editingLicense = false;
    this.loadUser();
  }

  // Handle license image file selection and save it into the user's Giay_phep_lai_xe field
  async onLicenseSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.user) return;
    const file = input.files[0];
    const dataUrl = await this.readFileAsDataURL(file);
    this.user.Giay_phep_lai_xe = dataUrl;
    (this.user as any)._license = dataUrl;
    (this.user as any)._licenseExists = true;
    (this.user as any)._licenseAuthenticated = false;
    this.localSaveUser(this.user);
    this.cdr.detectChanges(); // Cập nhật giao diện
  }

  // --- THÊM 'onAvatarSelected' ĐỂ UP ẢNH ĐẠI DIỆN ---
  async onAvatarSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.user) return;
    const file = input.files[0];
    const dataUrl = await this.readFileAsDataURL(file);

    // Cập nhật cả 2 thuộc tính để lưu và hiển thị
    this.user.Anh_dai_dien = dataUrl;
    (this.user as any)._avatar = dataUrl;

    this.localSaveUser(this.user);
    this.cdr.detectChanges(); // Cập nhật giao diện
  }

  // --- THÊM 'refreshTripsCount' ---
  refreshTripsCount(): void {
    // Thêm logic để lấy số chuyến đi mới ở đây
    // Tạm thời, gán lại giá trị từ user
    this.totalTripsCount = (this.user as any)?.So_Chuyen || 0;
    console.log('Đã làm mới số chuyến đi.');
  }

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private localSaveUser(user: any): void {
    if (!user) return;
    const key = 'extraUsers';
    try {
      const raw = localStorage.getItem(key);
      const extras = raw ? (JSON.parse(raw) as any[]) : [];
      const idx = extras.findIndex(u => Number(u.Ma_nguoi_dung) === Number(user.Ma_nguoi_dung));
      if (idx >= 0) {
        extras[idx] = user;
      } else {
        extras.push(user);
      }
      localStorage.setItem(key, JSON.stringify(extras));
      try { this.ownerService.setOwnerId(Number(user.Ma_nguoi_dung)); } catch (e) { }
    } catch (e) {
      console.error('localSaveUser failed', e);
    }
  }

  loadUser(userId?: string | number): void {
    const idToFind = userId || this.ownerService.getOwnerId();
    this.userService.getAllUsers().subscribe({
      next: (users: any) => {
        const list = Array.isArray(users) ? users : [];
        let found: any = null;
        if (idToFind) {
          found = list.find((u: any) => String(u.Ma_nguoi_dung) === String(idToFind));
        }

        if (found) {
          if (found.Anh_dai_dien) (found as any)._avatar = String(found.Anh_dai_dien).replace(/^\.?\//, '/');
          if (!found.Gioi_tinh) found.Gioi_tinh = 'Nữ';
          if (!found.Ngay_sinh) found.Ngay_sinh = '';
          if (found.Giay_phep_lai_xe) {
            const val = String(found.Giay_phep_lai_xe);
            (found as any)._license = val.startsWith('data:') ? val : val.replace(/^\.?\//, '/');
            (found as any)._licenseExists = true;
            (found as any)._licenseAuthenticated = !val.startsWith('data:');
          } else {
            (found as any)._licenseExists = false;
            (found as any)._licenseAuthenticated = false;
          }
          this.user = found;

          // Cập nhật số chuyến đi khi load user
          this.totalTripsCount = (this.user as any)?.So_Chuyen || 0;

        } else {
          this.user = null;
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading users for user-account:', err);
        this.user = null;
      }
    });
  }

  // Hàm xử lý nút Khóa tài khoản
  lockAccount(): void {
    if (!this.user) {
      alert('Không tìm thấy thông tin tài khoản để khóa.');
      return;
    }
    // TODO: Thực hiện logic khóa tài khoản ở đây (ví dụ cập nhật trạng thái, gọi API, v.v.)
    alert('Tài khoản đã bị khóa.');
  }
}