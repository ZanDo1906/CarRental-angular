import { iUser } from './../interfaces/User';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  url: string = './data/data/User.json';

  constructor(private _http: HttpClient) { }

  getAllUsers(): Observable<iUser[]> {
    return this._http
      .get<iUser[]>(this.url);
  }
}