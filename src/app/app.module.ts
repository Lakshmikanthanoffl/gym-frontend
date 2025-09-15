import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Layout & feature components
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MembersComponent } from './members/members.component';
import { PlansComponent } from './plans/plans.component';
import { PaymentsComponent } from './payments/payments.component';

// Angular modules
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MonthFilterPipe } from '../month-filter.pipe'; // correct path
import { ZXingScannerModule } from '@zxing/ngx-scanner';  // ✅ import this

// PrimeNG modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { CalendarModule } from 'primeng/calendar';
import { RecaptchaModule } from 'ng-recaptcha';
import { TabViewModule } from 'primeng/tabview';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect'; // ✅ add this
// Auth components
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';

// Loader interceptor and component
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { LoaderComponent } from './shared/loader/loader.component';  // Adjust path if needed

import { environment } from '../environments/environment';
import { AdminOnboardComponent } from './admin-onboard/admin-onboard.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { RazorpayDemoComponent } from './razorpay-demo/razorpay-demo.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsAndConditionsComponent } from './pages/terms-and-conditions/terms-and-conditions.component';
import { RefundPolicyComponent } from './pages/refund-policy/refund-policy.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { OurServicesComponent } from './pages/our-services/our-services.component';
import { BusinessModelComponent } from './pages/business-model/business-model.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    DashboardComponent,
    PlansComponent,
    PaymentsComponent,
    MembersComponent,
    HeaderComponent,
    LoginComponent,
    SignupComponent,
    LoaderComponent,
    AdminOnboardComponent,
    ContactUsComponent,
    SubscriptionComponent,
    RazorpayDemoComponent,
    PrivacyPolicyComponent,
    TermsAndConditionsComponent,
    RefundPolicyComponent,
    FooterComponent,
    AboutUsComponent,
    OurServicesComponent,
    BusinessModelComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MonthFilterPipe,  // <-- add pipe here
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,  // ✅ here
    HttpClientModule,
    ZXingScannerModule,  // ✅ add here'

    TableModule,
    TabViewModule,
    InputNumberModule,     // ✅ PrimeNG inputNumber
    InputSwitchModule,     // ✅ PrimeNG inputSwitch
    ButtonModule,
    DropdownModule,
    SplitButtonModule,
    ToastModule,
    MenuModule,
    DialogModule,
    CardModule,
    ChartModule,
    CalendarModule,
    RecaptchaModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
  ],
  providers: [
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
