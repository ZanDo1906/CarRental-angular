import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import carsData from '../../../assets/data/Car.json';
import usersData from '../../../assets/data/User.json';
import { OwnerService } from '../../services/owner.service';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.css',
})
export class VehicleDetail implements OnInit {
  car: any = null;
  owner: any = null;
  images: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ownerService: OwnerService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    let id = idParam ? Number(idParam) : null;
    // fallback to ownerService-stored id (some pages set it)
    if (!id) {
      id = this.ownerService.getOwnerId();
    }

    if (id != null) {
      this.car = (carsData as any[]).find((c: any) => c.Ma_xe === id) || null;
      if (this.car) {
        this.images = Array.isArray(this.car.Anh_xe) ? this.car.Anh_xe : [];
        this.owner = (usersData as any[]).find((u: any) => u.Ma_nguoi_dung === this.car.Ma_nguoi_dung) || null;
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/vehicle-management']);
  }

  vnd(n: number | string | undefined) {
    if (n == null) return '';
    const x = typeof n === 'number' ? n : Number(n);
    return x.toLocaleString('vi-VN');
  }

  deleteCar(): void {
    if (!this.car) return;
    const confirmed = confirm('Bạn có chắc muốn xóa xe này? Hành động không thể hoàn tác.');
    if (!confirmed) return;
    const arr = carsData as any[];
    const idx = arr.findIndex((c: any) => c.Ma_xe === this.car.Ma_xe);
    if (idx > -1) {
      arr.splice(idx, 1);
    }
    // clear stored id and go back to list
    this.ownerService.setOwnerId(null);
    this.router.navigate(['/vehicle-management']);
  }

  hideCar(): void {
    if (!this.car) return;
    const confirmed = confirm('Ẩn xe này khỏi danh sách công khai?');
    if (!confirmed) return;
    // mark status as hidden
    this.car.Tinh_trang_xe = 'Ẩn';
    // optionally persist hidden state list in localStorage
    try {
      const key = 'hiddenCarIds';
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) as number[] : [];
      if (!list.includes(this.car.Ma_xe)) list.push(this.car.Ma_xe);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      // ignore storage errors
    }
    this.ownerService.setOwnerId(null);
    this.router.navigate(['/vehicle-management']);
  }

  openOwnerDetail(ownerId: number | string): void {
    const id = Number(ownerId);
    if (isNaN(id)) return;
    try {
      this.ownerService.setOwnerId(id);
    } catch (e) {
      // ignore
    }
    this.router.navigate(['/account-detail', id]);
  }
}


