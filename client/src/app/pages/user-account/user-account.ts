import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SideBar } from '../side-bar/side-bar';
import { UserService } from '../../services/user';
import { Inject } from '@angular/core';
import { OwnerService } from '../../services/owner.service';
import { AuthService } from '../../services/auth';
import { CarRental } from '../../services/car-rental';

@Component({
  selector: 'app-user-account',
  imports: [CommonModule, RouterModule, SideBar, FormsModule],
  templateUrl: './user-account.html',
  styleUrl: './user-account.css',
})
export class UserAccount implements OnInit {

  user: any = null;
  // separate flags so profile edits and license edits are independent
  editingProfile: boolean = false;
  editingLicense: boolean = false;
  totalTrips: number = 0;

  constructor(
    private userService: UserService,
    @Inject(OwnerService) private ownerService: OwnerService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private carRentalService: CarRental,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    // Subscribe to auth service to get current user
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        // Use Ma_nguoi_dung from user data
        const userId = user.Ma_nguoi_dung;
        if (userId) {
          this.loadUserTrips(userId);
        }
      } else {
        console.log('No user logged in');
        this.totalTrips = 0;
      }
    });
  }

  // Load user's total trips count
  private loadUserTrips(userId: number): void {
    console.log('Loading trips for user ID:', userId);
    
    // Set initial value to ensure UI shows something
    this.totalTrips = 0;
    this.cdr.detectChanges();
    
    this.carRentalService.getUserRentals(userId).subscribe({
      next: (rentals) => {
        this.ngZone.run(() => {
          this.totalTrips = rentals.length;
          console.log(`User has ${this.totalTrips} trips`, rentals);
          // Save to localStorage for backup
          localStorage.setItem(`userTrips_${userId}`, this.totalTrips.toString());
          
          // Use setTimeout to ensure change detection happens after current execution
          setTimeout(() => {
            this.cdr.detectChanges();
          }, 0);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Error loading user trips:', error);
          // Try to get from localStorage as backup
          const cachedTrips = localStorage.getItem(`userTrips_${userId}`);
          this.totalTrips = cachedTrips ? parseInt(cachedTrips, 10) : 0;
          console.log(`Using cached trips count: ${this.totalTrips}`);
          // Force change detection even for cached data
          this.cdr.detectChanges();
        });
      }
    });
  }

  // Getter for avatar URL to ensure proper binding
  get avatarUrl(): string {
    return this.user?._avatar || this.user?.Anh_dai_dien || '/assets/images/user_avt.jpg';
  }

  // Getter for total trips to ensure proper binding
  get totalTripsCount(): number {
    return this.totalTrips;
  }

  // Method to manually refresh trips count
  refreshTripsCount(): void {
    if (this.user?.Ma_nguoi_dung) {
      this.loadUserTrips(this.user.Ma_nguoi_dung);
    }
  }

  // Keep the edit trigger simple for learners
  onEdit(field: string) {
    if (field === 'uploadGPLX') {
      // open file picker for license image upload
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

  // Save profile edits
  saveUser() {
    if (!this.user) return;
    this.localSaveUser(this.user);
    this.editingProfile = false;
    try { alert('Thông tin người dùng đã được lưu.'); } catch {}
  }

  // Save license-specific edits (number / name / birth)
  saveLicense() {
    if (!this.user) return;
    this.localSaveUser(this.user);
    this.editingLicense = false;
    try { alert('Thông tin GPLX đã được lưu.'); } catch {}
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
  }

  // Handle avatar image file selection and save it into the user's Anh_dai_dien field
  async onAvatarSelected(ev: Event) {
    console.log('Avatar selection started');
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.user) {
      console.log('No files selected or no user');
      return;
    }
    const file = input.files[0];
    console.log('Selected file:', file.name, file.size);
    
    try {
      const dataUrl = await this.readFileAsDataURL(file);
      console.log('Data URL generated:', dataUrl.substring(0, 100) + '...');
      
      // Update both fields to ensure compatibility
      this.user.Anh_dai_dien = dataUrl;
      (this.user as any)._avatar = dataUrl;
      
      console.log('User updated:', this.user);
      this.localSaveUser(this.user);
      
      // Force change detection
      this.cdr.detectChanges();
      
      // Reset file input to allow selecting the same file again
      input.value = '';
      
      console.log('Avatar saved successfully and change detected');
    } catch (error) {
      console.error('Error processing avatar file:', error);
    }
  }

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Very small helper for learners: save or replace the user object in localStorage under 'extraUsers'.
  // This avoids the need to understand a separate updateUser() service method.
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
      // tslint:disable-next-line:no-console
      console.error('localSaveUser failed', e);
    }
  }

  // Load a single user from the JSON (or merged extras) by id. If no id provided, uses currentUserId or first user.
  loadUser(userId?: string | number): void {
  const idToFind = userId || this.ownerService.getOwnerId();
    this.userService.getAllUsers().subscribe({
      next: (users: any) => {
        const list = Array.isArray(users) ? users : [];
        let found: any = null;
        if (idToFind) {
          found = list.find((u: any) => String(u.Ma_nguoi_dung) === String(idToFind));
        }
        if (!found && list.length > 0) found = list[0];

        if (found) {
          if (found.Anh_dai_dien) (found as any)._avatar = String(found.Anh_dai_dien).replace(/^\.?\//, '/');
          // Ensure basic profile defaults for learners
          if (!found.Gioi_tinh) {
            found.Gioi_tinh = 'Nữ';
          }
          if (!found.Ngay_sinh) {
            // keep empty string so <input type="date"> can bind safely
            found.Ngay_sinh = '';
          }
          if (found.Giay_phep_lai_xe) {
            const val = String(found.Giay_phep_lai_xe);
            (found as any)._license = val.startsWith('data:') ? val : val.replace(/^\.?\//, '/');
            (found as any)._licenseExists = true;
            (found as any)._licenseAuthenticated = !val.startsWith('data:');
          } else {
            (found as any)._licenseExists = false;
            (found as any)._licenseAuthenticated = false;
          }
        }

        this.user = found;
      },
      error: (err: any) => {
        console.error('Error loading users for user-account:', err);
      }
    });
  }

  // Simple helper to "send" the user data to other parts of the app by emitting a custom event.
  // Usage: call sendUserData(id) and listeners can receive the user object via window.addEventListener('userDataReady', ...)
  sendUserData(userId?: string | number): void {
    this.userService.getAllUsers().subscribe({
      next: (users: any) => {
        const list = Array.isArray(users) ? users : [];
        let payload: any = null;
        if (userId) payload = list.find((u: any) => String(u.Ma_nguoi_dung) === String(userId));
        if (!payload) payload = list.length ? list[0] : null;
        window.dispatchEvent(new CustomEvent('userDataReady', { detail: payload }));
      },
      error: (err: any) => {
        console.error('Error sending user data:', err);
      }
    });
  }
}
