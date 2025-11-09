import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(): boolean {
        // Kiểm tra xem admin đã đăng nhập chưa
        const currentAdmin = localStorage.getItem('currentAdmin');

        if (currentAdmin) {
            try {
                // Kiểm tra tính hợp lệ của dữ liệu
                const admin = JSON.parse(currentAdmin);
                if (admin && admin.So_dien_thoai) {
                    return true;
                }
            } catch (error) {
                console.error('Lỗi khi đọc dữ liệu admin từ localStorage:', error);
                localStorage.removeItem('currentAdmin');
            }
        }

        // Nếu chưa đăng nhập, chuyển hướng về trang login
        this.router.navigate(['/login']);
        return false;
    }
}