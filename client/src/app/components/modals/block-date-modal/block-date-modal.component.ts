import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-block-date-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './block-date-modal.component.html',
  styleUrls: ['./block-date-modal.component.css']
})
export class BlockDateModalComponent {
  @Input() show: boolean = false;
  @Input() blockStartDate: string = '';
  @Input() blockEndDate: string = '';
  @Input() blockReason: string = '';
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{startDate: string, endDate: string, reason: string}>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() reasonChange = new EventEmitter<string>();

  close() {
    this.closeModal.emit();
  }

  confirmBlock() {
    this.confirm.emit({
      startDate: this.blockStartDate,
      endDate: this.blockEndDate,
      reason: this.blockReason
    });
  }

  onStartDateChange(value: string) {
    this.blockStartDate = value;
    this.startDateChange.emit(value);
  }

  onEndDateChange(value: string) {
    this.blockEndDate = value;
    this.endDateChange.emit(value);
  }

  onReasonChange(value: string) {
    this.blockReason = value;
    this.reasonChange.emit(value);
  }
}
