import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OwnerService {
  private ownerIdSubject = new BehaviorSubject<number | null>(this.readFromStorage());
  public ownerId$ = this.ownerIdSubject.asObservable();

  private readFromStorage(): number | null {
    try {
      const v = localStorage.getItem('currentUserId');
      return v != null ? Number(v) : null;
    } catch (e) {
      return null;
    }
  }

  getOwnerId(): number | null {
    return this.ownerIdSubject.value;
  }

  setOwnerId(id: number | null) {
    try {
      if (id == null) {
        localStorage.removeItem('currentUserId');
      } else {
        localStorage.setItem('currentUserId', String(id));
      }
    } catch (e) {
      // ignore storage errors
    }
    this.ownerIdSubject.next(id);
  }
}
