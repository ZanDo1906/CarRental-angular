import { Routes } from '@angular/router';
import { AccountManagement } from './pages/account-management/account-management';
import { CarRegistrationApproval } from './pages/car-registration-approval/car-registration-approval';
import { Dashboard } from './pages/dashboard/dashboard';
import { CarDetail } from './pages/car-detail-approval/car-detail-approval';
import { LicenseApproval } from './pages/license-approval/license-approval';
import { AccountDetail } from './pages/account-detail/account-detail';
import { AdminAccount } from './pages/admin-account/admin-account';
import { LogIn } from './pages/log-in/log-in';
import { AuthGuard } from './guards/auth.guard';
import { VehicleManagement } from './pages/vehicle-management/vehicle-management';

export const routes: Routes = [
  { path: 'login', component: LogIn },
  { path: 'account', component: AccountManagement, canActivate: [AuthGuard] },
  { path: 'car-registration-approval', component: CarRegistrationApproval, canActivate: [AuthGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'car-detail-approval/:id', component: CarDetail, canActivate: [AuthGuard] },
  { path: 'license-approval', component: LicenseApproval, canActivate: [AuthGuard] },
  { path: 'account-detail', component: AccountDetail, canActivate: [AuthGuard] },
  { path: 'admin-account', component: AdminAccount, canActivate: [AuthGuard] },
  { path: 'vehicle-management', component: VehicleManagement, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
