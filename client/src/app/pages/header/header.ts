import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { iUser } from '../../interfaces/User';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true
})
export class Header {
  isLoggedIn: boolean = false;  // Luôn true để xem giao diện đã đăng nhập
  currentUser: iUser = {
    Ma_nguoi_dung: 1,
    Ho_va_ten: "Nguyen Van An",
    So_dien_thoai: "0912345678",
    Email: "an.nguyen@gmail.com",
    Mat_khau: "123456",
    Can_cuoc_cong_dan: "079203004512",
    Giay_phep_lai_xe: "GPLX123456",
    Vai_tro: "1",
    Anh_dai_dien: "./assets/images/user_avt.jpg",
    Ngay_tao: "2024-10-01",
    So_lan_vi_pham: 0
  };
  showUserMenu: boolean = false;

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }
}


