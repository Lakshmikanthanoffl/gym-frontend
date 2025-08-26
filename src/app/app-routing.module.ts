import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MembersComponent } from './members/members.component';
import { PlansComponent } from './plans/plans.component';
import { PaymentsComponent } from './payments/payments.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminOnboardComponent } from './admin-onboard/admin-onboard.component'; // Import later
import { ContactUsComponent } from './contact-us/contact-us.component';  // 👈 Import here
import { SubscriptionComponent } from './subscription/subscription.component';
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // Protected routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard' }
  },
  {
    path: 'members',
    component: MembersComponent,
    canActivate: [AuthGuard],
    data: { title: 'Members', roles: ['admin', 'superadmin'] } // ❗️Only admin
  },
  {
    path: 'plans',
    component: PlansComponent,
    canActivate: [AuthGuard],
    data: { title: 'Plans' } // ✅ All authenticated users
  },
  {
    path: 'payments',
    component: PaymentsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Payments', roles: ['admin', 'superadmin'] } // ❗️Only admin
  },
  {
    path: 'subscription',                     // 👈 New Route
    component: SubscriptionComponent,
    canActivate: [AuthGuard],                 // ✅ Only logged-in users
    data: { title: 'Subscription', roles: ['admin', 'superadmin'] } // Only admin/superadmin
  },
  {
    path: 'admin-onboard',
    component: AdminOnboardComponent, // Create this later
    canActivate: [AuthGuard],
    data: { title: 'Admin Onboard', roles: ['superadmin'] }
  },
  {
    path: 'contact-us',                     // 👈 New Route
    component: ContactUsComponent,
    canActivate: [AuthGuard],               // ✅ only logged-in users
    data: { title: 'Contact Us' }
  },
  // Fallback for unknown paths
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
