import { iAdmin } from './../interfaces/Admin';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  url: string = '/assets/data/Admin.json';

  constructor(private _http: HttpClient) { }

  getAllAdmins(): Observable<iAdmin[]> {
    return this._http
      .get<iAdmin[]>(this.url);
  }
}