import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Complaints {
  url: string = './assets/data/complaints.json';

  constructor(private _http: HttpClient) { }

  getAllComplaints(): Observable<any[]> {
    return this._http
      .get<any[]>(this.url);
  }
}
