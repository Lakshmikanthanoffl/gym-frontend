import { Component } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';
@Component({
  selector: 'app-contact-us',
  standalone: false,
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent {
  formData = {
    name: '',
    email: '',
    message: ''
  };
  isLoading = false;  // 👈 loader flag
  submitted = false;


  public sendEmail(e: Event) {
    e.preventDefault();
    this.isLoading = true;   // 👈 start loader
    this.submitted = true;

    emailjs.send(
      'service_lru3z9o',   // Service ID
      'template_yky09qo',  // Template ID
      this.formData,
      'JGLahuBchSiLeVlp7'  // Public Key
    ).then((result: EmailJSResponseStatus) => {
        console.log(result.text);
        alert('Message sent successfully!');
        this.formData = { name: '', email: '', message: '' }; // reset form
        this.isLoading = false; // 👈 stop loader
        this.submitted = false;
    }, (error) => {
        console.log(error.text);
        alert('Failed to send message. Please try again.');
        this.isLoading = false; // 👈 stop loader even on error
    });
  }
}
