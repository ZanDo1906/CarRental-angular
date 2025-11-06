import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user';
import { Inject } from '@angular/core';
import { OwnerService } from '../../services/owner.service';

@Component({
  selector: 'app-account-detail',
  standalone: true, 
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './account-detail.html',
  styleUrl: './account-detail.css',
})
export class AccountDetail  implements OnInit {

  user: any = null;
  // separate flags so profile edits and license edits are independent
  editingProfile: boolean = false;
  editingLicense: boolean = false;

  constructor(private userService: UserService, @Inject(OwnerService) private ownerService: OwnerService, private router: Router ) { }

  ngOnInit(): void {
    // On init, just load the current user (if currentUserId is set) or the first user
    this.loadUser();
  }

  goBack(): void {
    this.router.navigate(['/account']);
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
