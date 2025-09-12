import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MembersComponent } from './members/members.component';
import { PlansComponent } from './plans/plans.component';
import { PaymentsComponent } from './payments/payments.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminOnboardComponent } from './admin-onboard/admin-onboard.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { RazorpayDemoComponent } from './razorpay-demo/razorpay-demo.component';

// 👉 import your new Legal components
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { RefundPolicyComponent } from './pages/refund-policy/refund-policy.component';
import { TermsAndConditionsComponent } from './pages/terms-and-conditions/terms-and-conditions.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'razorpay-demo', component: RazorpayDemoComponent, data: { title: 'Razorpay Demo' } },

  // Protected routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard', roles: ['admin', 'superadmin'], privileges: ['dashboard'] }
  },
  {
    path: 'members',
    component: MembersComponent,
    canActivate: [AuthGuard],
    data: { title: 'Members', roles: ['admin', 'superadmin'], privileges: ['members'] }
  },
  {
    path: 'plans',
    component: PlansComponent,
    canActivate: [AuthGuard],
    data: { title: 'Plans', privileges: ['plans'] }
  },
  {
    path: 'payments',
    component: PaymentsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Payments', roles: ['admin', 'superadmin'], privileges: ['payments'] }
  },
  {
    path: 'subscription',
    component: SubscriptionComponent,
    canActivate: [AuthGuard],
    data: { title: 'Subscription', roles: ['admin', 'superadmin'], privileges: ['subscription'] }
  },
  {
    path: 'admin-onboard',
    component: AdminOnboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Admin Onboard', roles: ['superadmin'], privileges: ['adminOnboard'] }
  },
  {
    path: 'contact-us',
    component: ContactUsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Contact Us' }
  },

  // Legal pages (usually public, no AuthGuard)
  { path: 'privacy-policy', component: PrivacyPolicyComponent, data: { title: 'Privacy Policy' } },
  { path: 'refund-policy', component: RefundPolicyComponent, data: { title: 'Refund Policy' } },
  { path: 'terms-and-conditions', component: TermsAndConditionsComponent, data: { title: 'Terms & Conditions' } },

  // Fallback
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
