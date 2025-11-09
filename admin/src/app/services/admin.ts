import { iAdmin } from './../interfaces/Admin';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  url: string = '/assets/data/Admin.json';
  private localKey = 'adminUpdates';

  constructor(private _http: HttpClient) { }

  private readUpdates(): any {
    try {
      const raw = localStorage.getItem(this.localKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private writeUpdates(updates: any): void {
    localStorage.setItem(this.localKey, JSON.stringify(updates));
  }

  getAllAdmins(): Observable<iAdmin[]> {
    return this._http.get<iAdmin[]>(this.url).pipe(
      map(admins => {
        const updates = this.readUpdates();
        return admins.map(admin => ({
          ...admin,
          ...updates[admin.Ma_nguoi_dung]
        }));
      })
    );
  }

  updateAdmin(admin: iAdmin): Observable<iAdmin> {
    const updates = this.readUpdates();
    updates[admin.Ma_nguoi_dung] = admin;
    this.writeUpdates(updates);
    return of(admin);
  }

  getAdminById(id: string): Observable<iAdmin | undefined> {
    return this.getAllAdmins().pipe(
      map(admins => admins.find(a => a.Ma_nguoi_dung === id))
    );
  }
}