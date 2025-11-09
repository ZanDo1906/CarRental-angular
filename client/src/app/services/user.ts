import { iUser } from './../interfaces/User';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  url: string = '/assets/data/User.json';

  constructor(private _http: HttpClient) { }

  private localKey = 'extraUsers';
  private readExtras(): iUser[] {
    try {
      const raw = localStorage.getItem(this.localKey);
      return raw ? (JSON.parse(raw) as iUser[]) : [];
    } catch {
      return [];
    }
  }

  private writeExtras(users: iUser[]): void {
    localStorage.setItem(this.localKey, JSON.stringify(users));
  }

  // Trả về danh sách gốc + người dùng tạo mới (localStorage)
  getAllUsers(): Observable<iUser[]> {
    return this._http.get<iUser[]>(this.url).pipe(
      map(assetUsers => {
        const extras = this.readExtras();
        return [...assetUsers, ...extras];
      })
    );
  }

  // Lưu người dùng mới (giả lập lưu file)
  addUser(user: iUser) {
    const extras = this.readExtras();
    extras.push(user);
    this.writeExtras(extras);
    return of(user);
  }

  getCurrentUserId(): number | null {
    // Đọc từ AuthService thay vì localStorage riêng biệt
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.Ma_nguoi_dung || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  getCurrentUser(): Observable<iUser | null> {
    // Đọc trực tiếp từ localStorage currentUser
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return of(user);
      } catch {
        return of(null);
      }
    }
    return of(null);
  }
}