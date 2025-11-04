import { Routes } from '@angular/router';
import { CarList } from './pages/carList/carList';
import { CarDetail } from './pages/car-detail/car-detail';

export const routes: Routes = [
    { path: '', component: CarList },          // trang danh sách
    { path: 'xe/:id', component: CarDetail },  // trang chi tiết
    { path: '**', redirectTo: '' },
];
