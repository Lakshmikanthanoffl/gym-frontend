import { Component } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';

@Component({
  selector: 'app-contact-us',
  standalone: false,
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css'] // ✅ fixed typo
})
export class ContactUsComponent {
  formData = {
    from_name: '',   // ✅ must match EmailJS variable
    reply_to: '',    // ✅ must match EmailJS variable
    message: ''      // ✅ must match EmailJS variable
  };
  isLoading = false;
  submitted = false;

  public sendEmail(e: Event) {
    e.preventDefault();
    this.isLoading = true;
    this.submitted = true;

    // 1️⃣ Send mail to Admin (your inbox)
    emailjs.send(
      'service_lru3z9o',   // Service ID
      'template_yky09qo',  // Admin Template ID
      this.formData,       // ✅ directly send mapped object
      'JGLahuBchSiLeVlp7'  // Public Key
    ).then((result: EmailJSResponseStatus) => {
        console.log("✅ Admin email sent:", result.text);

        // 2️⃣ Send Auto-Reply to User
        return emailjs.send(
          'service_lru3z9o',
          'template_kvf6n1n', // 🔹 your auto-reply template ID
          {
            from_name: "Your Company",        // 👈 sender name in auto-reply
            to_name: this.formData.from_name, // recipient's name
            reply_to: this.formData.reply_to, // recipient's email
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
  }
}
