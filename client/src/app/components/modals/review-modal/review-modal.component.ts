import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { iCar_rental } from '../../../interfaces/Car_rental';
import { iCar } from '../../../interfaces/Car';

type RentalWithCar = iCar_rental & { car_details: iCar };

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-modal.component.html',
  styleUrls: ['./review-modal.component.css']
})
export class ReviewModalComponent {
  @Input() show = false;
  @Input() selectedRental: RentalWithCar | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitReview = new EventEmitter<{rating: number, comment: string}>();

  reviewRating = 5;
  reviewComment = '';

  onClose(): void {
    this.reviewRating = 5;
    this.reviewComment = '';
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (!this.reviewComment.trim()) {
      alert('Vui lòng nhập nhận xét của bạn');
      return;
    }
    this.submitReview.emit({
      rating: this.reviewRating,
      comment: this.reviewComment
    });
    this.onClose();
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }
}
