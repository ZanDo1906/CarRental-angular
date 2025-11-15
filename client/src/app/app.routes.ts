import { Routes } from '@angular/router';
import { CarList } from './pages/carList/carList';
import { CarDetail } from './pages/car-detail/car-detail';
import { BecomeCarOwner } from './pages/become-car-owner/become-car-owner';
import { CarRegistration } from './pages/car-registration/car-registration';
import { AboutTrustCar } from './pages/about-trustcar/about-trustcar';
import { Homepage } from './pages/homepage/homepage';
import { ConfirmBooking } from './pages/confirm-booking/confirm-booking';
import { CarRentalGuide } from './pages/car-rental-guide/car-rental-guide';
import { UserAccount } from './pages/user-account/user-account';
import { LogIn } from './pages/log-in/log-in';
import { UserCar } from './pages/user-car/user-car';
import { UserRental } from './pages/user-rental/user-rental';
import { Dashboard } from './pages/dashboard/dashboard';
// import { VehicleManagement } from '../../../admin/src/app/pages/vehicle-management/vehicle-management';
import { Contact } from './pages/contact/contact';
import { UserLayoutComponent } from './pages/user-layout/user-layout.component';

export const routes: Routes = [
    { path: '', component: Homepage },         // trang homepage
    { path: 'log-in', component: LogIn },         // trang đăng nhập
    { path: 'danh-sach-xe', component: CarList }, // trang danh sách xe
    { path: 'xe/:id', component: CarDetail },  // trang chi tiết
    { path: 'tro-thanh-chu-xe', component: BecomeCarOwner }, // trang trở thành chủ xe
    { path: 'owner', component: BecomeCarOwner }, // alias cho header "Trở thành chủ xe"
    { path: 'dk-cho-thue-xe', component: CarRegistration }, // trang đăng ký cho thuê xe
    { path: 've-trust-car', component: AboutTrustCar }, // trang Về Trustcar
    { path: 'confirm-booking/:id', component: ConfirmBooking }, // trang xác nhận đặt xe
    { path: 'guide', component: CarRentalGuide }, // trang Hướng dẫn thuê xe
    
    // User Layout với sidebar cố định
    {
        path: '',
        component: UserLayoutComponent,
        children: [
            { path: 'user-account', component: UserAccount }, // trang Tài khoản người dùng
            { path: 'user-car', component: UserCar }, // trang Quản lý xe của tôi
            { path: 'user-rental', component: UserRental }, // trang Quản lý cho thuê
            { path: 'dashboard', component: Dashboard }, // trang Dashboard
        ]
    },
    
    // { path: 'vehicle-management', component: VehicleManagement }, // trang Quản lý xe (Admin)
    { path: 'lien-he', component: Contact }, // trang Liên hệ
    { path: '**', redirectTo: '' },

];
