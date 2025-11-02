import { iReview } from './../interfaces/review';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  url: string = '/assets/data/review.json';

  constructor(private _http: HttpClient) { }

  getAllReviews(): Observable<iReview[]> {
    return this._http
      .get<iReview[]>(this.url);
  }
}