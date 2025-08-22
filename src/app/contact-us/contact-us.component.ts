import { Component } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact-us',
  standalone: false,
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent {
  formData = {
    from_name: '',
    reply_to: '',
    message: ''
  };
  isLoading = false;
  submitted = false;

  // ✅ reCAPTCHA token
  recaptchaToken: string | null = null;

  // ✅ When captcha is resolved, save the token
  onCaptchaResolved(token: string | null) {
    this.recaptchaToken = token;
  }
  

  // ✅ simple email regex check
  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  public sendEmail(e: Event) {
    e.preventDefault();
  
    // 1️⃣ Validate before sending
    if (!this.formData.from_name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Name',
        text: 'Please enter your name.',
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#00b894'
      });
      return;
    }
    if (!this.isValidEmail(this.formData.reply_to)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#d63031'
      });
      return;
    }
    if (!this.formData.message.trim()) {
      Swal.fire({
        icon: 'info',
        title: 'Empty Message',
        text: 'Please enter your message.',
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#0984e3'
      });
      return;
    }
    if (!this.recaptchaToken) {
      Swal.fire({
        icon: 'warning',
        title: 'Verification Needed',
        text: '⚠️ Please verify you are not a robot.',
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#e17055'
      });
      return;
    }
  
    this.isLoading = true;
    this.submitted = true;
  
    // 2️⃣ Send mail to Admin
    emailjs.send(
      'service_lru3z9o',
      'template_yky09qo',
      this.formData,
      'JGLahuBchSiLeVlp7'
    ).then((result: EmailJSResponseStatus) => {
      console.log("✅ Admin email sent:", result.text);
  
      // 3️⃣ Auto-reply to User
      return emailjs.send(
        'service_lru3z9o',
        'template_kvf6n1n',
        {
          from_name: "Your Company",
          to_name: this.formData.from_name,
          reply_to: this.formData.reply_to,
          message: `Hi ${this.formData.from_name}, thanks for contacting us! We’ll get back to you shortly.`
        },
        'JGLahuBchSiLeVlp7'
      );
    }).then((res: EmailJSResponseStatus) => {
      console.log("✅ Auto-reply sent:", res.text);
      Swal.fire({
        icon: 'success',
        title: 'Message Sent!',
        text: '✅ A confirmation email has been sent to you.',
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#00b894'
      });
      this.resetForm();
    }).catch((error) => {
      console.error("❌ Error:", error.text);
      Swal.fire({
        icon: 'error',
        title: 'Something went wrong',
        text: 'Message sent, but auto-reply failed ❗',
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#d63031'
      });
      this.resetForm();
    });
  }
  

  private resetForm() {
    this.formData = { from_name: '', reply_to: '', message: '' };
    this.isLoading = false;
    this.submitted = false;
    this.recaptchaToken = null; // reset captcha too
  }
}
