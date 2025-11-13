import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { iAdmin } from '../interfaces/Admin';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentAdminSubject = new BehaviorSubject<iAdmin | null>(null);
    public currentAdmin$ = this.currentAdminSubject.asObservable();

    constructor(private router: Router) {
        // Khôi phục trạng thái đăng nhập từ localStorage nếu có
        const savedAdmin = localStorage.getItem('currentAdmin');
        if (savedAdmin) {
            try {
                const admin = JSON.parse(savedAdmin);
                this.currentAdminSubject.next(admin);
            } catch (error) {
                console.error('Lỗi khi đọc dữ liệu admin từ localStorage:', error);
                localStorage.removeItem('currentAdmin');
            }
        }
    }

    login(admin: iAdmin): void {
        localStorage.setItem('currentAdmin', JSON.stringify(admin));
        this.currentAdminSubject.next(admin);
        this.router.navigate(['/dashboard']); // Điều hướng đến trang dashboard sau khi đăng nhập
    }

    logout(): void {
        localStorage.removeItem('currentAdmin');
        this.currentAdminSubject.next(null);
    }

    getCurrentAdmin(): iAdmin | null {
        return this.currentAdminSubject.value;
    }

    isLoggedIn(): boolean {
        return this.currentAdminSubject.value !== null;
    }
}