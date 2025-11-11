import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { iCar } from '../../../interfaces/Car';

@Component({
  selector: 'app-car-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './car-edit-modal.component.html',
  styleUrls: ['./car-edit-modal.component.css']
})
export class CarEditModalComponent {
  @Input() show: boolean = false;
  @Input() editingCar: any = null;
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveCar = new EventEmitter<any>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() imageSelected = new EventEmitter<Event>();
  @Output() imageRemoved = new EventEmitter<number>();

  onClose(): void {
    this.closeModal.emit();
  }

  onSave(): void {
    this.saveCar.emit(this.editingCar);
  }

  onCancel(): void {
    this.cancelEdit.emit();
  }

  onImageSelected(event: Event): void {
    this.imageSelected.emit(event);
  }

  removeImage(index: number): void {
    this.imageRemoved.emit(index);
  }

  vnd(n: number | string | undefined): string {
    if (n == null) return '';
    const x = typeof n === 'number' ? n : Number(n);
    return x.toLocaleString('vi-VN');
  }
}
