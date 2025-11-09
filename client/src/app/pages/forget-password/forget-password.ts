import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forget-password',
  imports: [FormsModule, CommonModule],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css',
})
export class ForgetPassword {
  forgotIdentifier: string = '';
  forgotError: string = '';

  onSendReset() {
    // Clear previous error
    this.forgotError = '';
    
    // Validate input
    if (!this.forgotIdentifier.trim()) {
      this.forgotError = 'Vui lòng nhập số điện thoại hoặc email.';
      return;
    }

    // Basic email/phone validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10,11}$/;
    
    if (!emailPattern.test(this.forgotIdentifier) && !phonePattern.test(this.forgotIdentifier)) {
      this.forgotError = 'Vui lòng nhập email hoặc số điện thoại hợp lệ.';
      return;
    }

    // TODO: Implement actual password reset logic
    // For now, just show a success message
    alert('Hướng dẫn đặt lại mật khẩu đã được gửi!');
    
    // Reset form
    this.forgotIdentifier = '';
  }
}
