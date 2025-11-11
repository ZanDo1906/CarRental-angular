import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BlockedDate } from '../interfaces/BlockedDate';

@Injectable({
  providedIn: 'root'
})
export class BlockedDateService {
  private apiUrl = 'assets/data/BlockedDates.json';
  private blockedDatesSubject = new BehaviorSubject<BlockedDate[]>([]);
  public blockedDates$ = this.blockedDatesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadBlockedDates();
  }

  private loadBlockedDates() {
    this.http.get<BlockedDate[]>(this.apiUrl).subscribe(dates => {
      this.blockedDatesSubject.next(dates);
    });
  }

  getAllBlockedDates(): Observable<BlockedDate[]> {
    return this.http.get<BlockedDate[]>(this.apiUrl);
  }

  getBlockedDatesByCar(carId: number): Observable<BlockedDate[]> {
    return this.getAllBlockedDates().pipe(
      map(dates => dates.filter(d => Number(d.Ma_xe) === Number(carId)))
    );
  }

  addBlockedDate(blockedDate: BlockedDate): Observable<BlockedDate> {
    // Trong thực tế, đây sẽ là API call POST
    // Hiện tại chỉ lưu vào localStorage để demo
    return new Observable(observer => {
      const stored = localStorage.getItem('blockedDates');
      const blockedDates: BlockedDate[] = stored ? JSON.parse(stored) : [];
      
      // Generate ID
      const maxId = blockedDates.length > 0 
        ? Math.max(...blockedDates.map(d => d.Ma_block || 0)) 
        : 0;
      
      blockedDate.Ma_block = maxId + 1;
      blockedDate.Ngay_tao = new Date().toISOString();
      
      blockedDates.push(blockedDate);
      localStorage.setItem('blockedDates', JSON.stringify(blockedDates));
      
      this.blockedDatesSubject.next(blockedDates);
      
      observer.next(blockedDate);
      observer.complete();
    });
  }

  removeBlockedDate(blockId: number): Observable<void> {
    return new Observable(observer => {
      const stored = localStorage.getItem('blockedDates');
      if (stored) {
        let blockedDates: BlockedDate[] = JSON.parse(stored);
        blockedDates = blockedDates.filter(d => d.Ma_block !== blockId);
        localStorage.setItem('blockedDates', JSON.stringify(blockedDates));
        this.blockedDatesSubject.next(blockedDates);
      }
      
      observer.next();
      observer.complete();
    });
  }

  getBlockedDatesForCar(carId: number): Observable<BlockedDate[]> {
    // Load từ localStorage trước
    const stored = localStorage.getItem('blockedDates');
    const blockedDates: BlockedDate[] = stored ? JSON.parse(stored) : [];
    
    return new Observable(observer => {
      const filtered = blockedDates.filter(d => Number(d.Ma_xe) === Number(carId));
      observer.next(filtered);
      observer.complete();
    });
  }
}
