import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BookingData {
  location?: string | null;
  pickupTime: string;
  returnTime: string;
  pickupOption?: string; // 'atLocation' hoặc 'delivery'
  deliveryAddress?: string; // Địa chỉ giao xe nếu chọn delivery
  carInfo?: {
    id: number;
    name: string;
    price: number;
    seats: string;
    fuel: string;
    transmission: string;
    fuelConsumption: string;
    images?: string[];
  };
  paymentInfo?: {
    subtotal: number;
    discount: number;
    vat: number;
    total: number;
  };
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
      returnTime: '',
      carInfo: undefined,
      paymentInfo: undefined
    });
  }
}
