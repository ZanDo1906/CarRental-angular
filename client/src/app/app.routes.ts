import { Routes } from '@angular/router';
import { CarList } from './pages/carList/carList';
import { CarDetail } from './pages/car-detail/car-detail';
import { TroThanhChuXe } from './pages/tro-thanh-chu-xe/tro-thanh-chu-xe';
import { DKChoThueXe } from './pages/dk-cho-thue-xe/dk-cho-thue-xe';
import { VeTrustCar } from './pages/ve-trust-car/ve-trust-car';
import { Homepage } from './pages/homepage/homepage';
import { LienHe } from './pages/lien-he/lien-he';

export const routes: Routes = [
    { path: '', component: Homepage },         // trang homepage
    { path: 'danh-sach-xe', component: CarList }, // trang danh sách xe
    { path: 'xe/:id', component: CarDetail },  // trang chi tiết
    { path: 'tro-thanh-chu-xe', component: TroThanhChuXe }, // trang trở thành chủ xe
    { path: 'dk-cho-thue-xe', component: DKChoThueXe }, // trang đăng ký cho thuê xe
    { path: 've-trust-car', component: VeTrustCar }, // trang Về Trustcar
    { path: 'lien-he', component: LienHe }, // trang Liên hệ
    { path: '**', redirectTo: '' },

];
