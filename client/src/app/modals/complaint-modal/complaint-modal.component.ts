import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { iCar_rental } from '../../interfaces/Car_rental';
import { iCar } from '../../interfaces/Car';

type RentalWithCar = iCar_rental & { car_details: iCar };

@Component({
  selector: 'app-complaint-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complaint-modal.component.html',
  styleUrls: ['./complaint-modal.component.css']
})
export class ComplaintModalComponent {
  @Input() show = false;
  @Input() selectedRental: RentalWithCar | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitComplaint = new EventEmitter<{reason: string, description: string}>();

  complaintReason = '';
  complaintDescription = '';

  onClose(): void {
    this.complaintReason = '';
    this.complaintDescription = '';
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (!this.complaintReason.trim()) {
      alert('Vui lòng chọn lý do khiếu nại');
      return;
    }

    if (!this.complaintDescription.trim()) {
      alert('Vui lòng mô tả chi tiết khiếu nại');
      return;
    }

    this.submitComplaint.emit({
      reason: this.complaintReason,
      description: this.complaintDescription
    });
    this.onClose();
  }
}
