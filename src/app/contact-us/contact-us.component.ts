import { Component } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';

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
      alert("Please enter your name.");
      return;
    }
    if (!this.isValidEmail(this.formData.reply_to)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!this.formData.message.trim()) {
      alert("Please enter your message.");
      return;
    }
    if (!this.recaptchaToken) {
      alert("⚠️ Please verify you are not a robot.");
      return;
    }

    this.isLoading = true;
    this.submitted = true;

    // 2️⃣ Send mail to Admin
    emailjs.send(
      'service_lru3z9o',   // Service ID
      'template_yky09qo',  // Admin Template ID
      this.formData,
      'JGLahuBchSiLeVlp7'  // Public Key
    ).then((result: EmailJSResponseStatus) => {
        console.log("✅ Admin email sent:", result.text);

        // 3️⃣ Send Auto-Reply to User
        return emailjs.send(
          'service_lru3z9o',
          'template_kvf6n1n', // Auto-reply template
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
        alert('Message sent successfully! ✅ A confirmation email has been sent to you.');
        this.resetForm();
    }).catch((error) => {
        console.error("❌ Error:", error.text);
        alert('Message sent, but auto-reply failed ❗');
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
