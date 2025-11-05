import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BookingData {
  location?: string | null;
  pickupTime: string;
  returnTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingDataService {
  private bookingDataSubject = new BehaviorSubject<BookingData>({
    location: null,
    pickupTime: '',
    returnTime: ''
  });

  bookingData$ = this.bookingDataSubject.asObservable();

  setBookingData(data: BookingData) {
    this.bookingDataSubject.next(data);
  }

  getBookingData(): BookingData {
    return this.bookingDataSubject.value;
  }

  clearBookingData() {
    this.bookingDataSubject.next({
      location: null,
      pickupTime: '',
      returnTime: ''
    });
  }
}
