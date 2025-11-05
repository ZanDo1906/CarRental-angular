import { Routes } from '@angular/router';
import { AccountManagement } from './pages/account-management/account-management';
import { CarRegistrationApproval } from './pages/car-registration-approval/car-registration-approval';
import { Dashboard } from './pages/dashboard/dashboard';
import { CarDetail } from './pages/car-detail-approval/car-detail-approval';
import { LicenseApproval } from './pages/license-approval/license-approval';

export const routes: Routes = [
  { path: '', component: AccountManagement }, // trang mặc định
  { path: 'account', component: AccountManagement },
  { path: 'car-registration-approval', component: CarRegistrationApproval },
  { path: 'dashboard', component: Dashboard },
  { path: 'car-detail-approval/:id', component: CarDetail },
  { path: 'license-approval', component: LicenseApproval},
];
