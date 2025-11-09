import { Component, ElementRef, QueryList, ViewChildren, AfterViewInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import id from '@angular/common/locales/id';

@Component({
  selector: 'app-forget-password',
  imports: [FormsModule, CommonModule],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css',
})
export class ForgetPassword {
  forgotIdentifier: string = '';
  forgotError: string = '';
  showVerification: boolean = false;
  maskedIdentifier: string = '';
  otpLength: number = 6;
  otp: string[] = new Array(this.otpLength).fill('');

  @ViewChildren('otpInput', { read: ElementRef }) otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private modalEl: HTMLElement | null = null;
  private boundOnHidden = this.handleModalHidden.bind(this);

  ngAfterViewInit(): void {
    // lấy element modal theo id và đăng ký listener cho sự kiện hidden.bs.modal
    this.modalEl = document.getElementById('forgetPasswordModal');
    if (this.modalEl) {
      this.modalEl.addEventListener('hidden.bs.modal', this.boundOnHidden as EventListener);
    }
  }

  ngOnDestroy(): void {
    if (this.modalEl) {
      this.modalEl.removeEventListener('hidden.bs.modal', this.boundOnHidden as EventListener);
    }
  }

  private handleModalHidden(): void {
    // reset về trạng thái ban đầu (Step 1) khi modal bị đóng
    this.showVerification = false;
    this.forgotIdentifier = '';
    this.forgotError = '';
    this.maskedIdentifier = '';
    this.otp = new Array(this.otpLength).fill('');
    // nếu cần clear trực tiếp các input OTP (nếu vẫn còn)
    if (this.otpInputs) {
      this.otpInputs.forEach(q => {
        try { (q.nativeElement as HTMLInputElement).value = ''; } catch { /* ignore */ }
      });
    }
  }



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

    // TODO: gọi API gửi mã xác thực ở đây
    this.maskedIdentifier = this.maskIdentifier(this.forgotIdentifier);
    this.showVerification = true;
    this.otp = new Array(this.otpLength).fill('');

    // focus ô đầu tiên sau khi modal render
    setTimeout(() => {
      const first = this.otpInputs?.toArray()[0];
      first?.nativeElement?.focus();
    }, 120);
  }
  maskIdentifier(id: string): string {
    if (id.includes('@')) {
      const [local, domain] = id.split('@');
      if (local.length <= 2) return local[0] + '***@' + domain;
      const start = local[0];
      const end = local[local.length - 1];
      const middle = '*'.repeat(Math.max(3, local.length - 2));
      return `${start}${middle}${end}@${domain}`;
    }
    const digits = id.replace(/\D/g, '');
    if (digits.length <= 5) return digits.replace(/.(?=.)/g, '*');
    const first = digits.slice(0, 3);
    const last = digits.slice(-2);
    const middle = '*'.repeat(Math.max(3, digits.length - 5 + 1));
    return `${first}${middle}${last}`;
  }

  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    // chỉ giữ lại ký tự số
    let value = (input.value || '').replace(/\D/g, '');

    if (!value) { 
      this.otp[index] = '';
      input.value = '';
      return;
    }
    
    if (value.length > 1) {
      const chars = value.split('');
      for (let i = 0; i < chars.length && (index + i) < this.otpLength; i++) {
        const el = this.otpInputs?.toArray()[index + i];
        if (el) {
          el.nativeElement.value = chars[i];
        }
        this.otp[index + i] = chars[i];
      }
      const nextIdx = Math.min(this.otpLength - 1, index + value.length);
      const nextEl = this.otpInputs?.toArray()[nextIdx];
      nextEl?.nativeElement?.focus();
      return;
    }
    
    const digit = value.charAt(0);
    input.value = digit;
    this.otp[index] = digit;

    
  }

  onVerify() {
    const code = this.otp.join('');
    if (code.length < this.otpLength) {
      this.forgotError = 'Vui lòng nhập đầy đủ mã xác thực.';
      return;
    }

    // TODO: gọi API verify code với this.forgotIdentifier
    console.log('Verify', code, 'for', this.forgotIdentifier);
    alert('Mã xác thực đã được gửi (demo).');
    // Sau verify có thể chuyển sang đổi mật khẩu hoặc đóng modal
  }
  onResend(e?: Event) {
    e?.preventDefault();
    // TODO: gọi API resend
    this.otp = new Array(this.otpLength).fill('');
    setTimeout(() => {
      const first = this.otpInputs?.toArray()[0];
      first?.nativeElement?.focus();
    }, 120);
  }
}
