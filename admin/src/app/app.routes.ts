import { Routes } from '@angular/router';
import { AccountManagement } from './pages/account-management/account-management';
import { CarRegistrationApproval } from './pages/car-registration-approval/car-registration-approval';

export const routes: Routes = [
  { path: '', component: AccountManagement }, // trang mặc định
  { path: 'account', component: AccountManagement },
  { path: 'car-registration-approval', component: CarRegistrationApproval},
];
