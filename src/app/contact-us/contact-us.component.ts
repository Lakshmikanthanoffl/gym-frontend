import { Component, OnInit, ViewChild } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';
import Swal from 'sweetalert2';
import { RecaptchaComponent } from 'ng-recaptcha';
import { ThemeService } from '../services/theme.service';
@Component({
  selector: 'app-contact-us',
  standalone: false,
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {
  @ViewChild('captchaRef') captchaRef!: RecaptchaComponent;
  formData = {
    from_name: '',
    reply_to: '',
    message: ''
  };
  isLoading = false;
  submitted = false;
  showCaptcha = true;
  currentTheme: 'light' | 'dark' = 'dark'; // default
  
  constructor(private themeService: ThemeService) {}
  ngOnInit() {
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
  
      if (this.captchaRef) {
        // Force re-render
        this.showCaptcha = false; // remove from DOM
        setTimeout(() => {
          this.showCaptcha = true; // re-add to DOM with new theme
        }, 0);
      }
    });
  }
  

  
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
  
  openEmailCompose(event: Event) {
    event.preventDefault(); // Prevent default mailto action
  
    const email = 'zyct.official@gmail.com';
    const subject = encodeURIComponent('Contact Us');
    const body = encodeURIComponent('Hello');
  
    // Gmail app URL scheme
    const gmailUrl = `googlegmail://co?to=${email}&subject=${subject}&body=${body}`;
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
  
    // Detect mobile or desktop
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
    if (isMobile) {
      // Try Gmail app first, fallback to mailto
      window.location.href = gmailUrl;
      setTimeout(() => {
        // If Gmail not installed, fallback to mailto
        window.location.href = mailtoUrl;
      }, 500);
    } else {
      // On desktop, open Gmail in browser compose
      const gmailWebUrl = `https://mail.google.com/mail/?view=cm&to=${email}&su=${subject}&body=${body}`;
      window.open(gmailWebUrl, '_blank');
    }
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
        'template_urqxi64',
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
    // emailjs.send(
    //   'service_lru3z9o',
    //   'template_yky09qo',
    //   this.formData,
    //   'JGLahuBchSiLeVlp7'
    // ).then((result: EmailJSResponseStatus) => {
    //   console.log("✅ Email sent to Admin:", result.text);
    
    //   Swal.fire({
    //     icon: 'success',
    //     title: 'Email Sent Successfully!',
    //     text: 'Your message has been delivered professionally.',
    //     background: '#1e1e1e',
    //     color: '#f5f5f5',
    //     confirmButtonColor: '#00b894'
    //   });
    
    //   this.resetForm();
    
    // }).catch((error) => {
    //   console.error("❌ Error:", error.text);
    
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Sending Failed',
    //     text: 'Something went wrong while sending your email.',
    //     background: '#1e1e1e',
    //     color: '#f5f5f5',
    //     confirmButtonColor: '#d63031'
    //   });
    
    //   this.resetForm();
    // });
    
  }
  

  private resetForm() {
    this.formData = { from_name: '', reply_to: '', message: '' };
    this.isLoading = false;
    this.submitted = false;
    this.recaptchaToken = null; // reset captcha too
  }
}
