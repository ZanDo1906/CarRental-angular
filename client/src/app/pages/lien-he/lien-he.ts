import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lien-he',
  imports: [FormsModule, CommonModule],
  templateUrl: './lien-he.html',
  styleUrl: './lien-he.css',
})
export class LienHe {
  showSuccessMessage = false;

  formData = {
    name: '',
    phone: '',
    email: '',
    message: ''
  };

  onSubmit() {
    // Hiển thị thông báo thành công
    this.showSuccessMessage = true;

    // Reset form sau 3 giây
    setTimeout(() => {
      this.showSuccessMessage = false;
      this.formData = {
        name: '',
        phone: '',
        email: '',
        message: ''
      };
    }, 3000);
  }
}
