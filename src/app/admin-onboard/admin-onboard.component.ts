import { Component, OnInit } from '@angular/core';
import { MemberService } from '../services/member.service'; 
export interface Role {
  roleId: number;
  roleName: string;
  userName: string;
  userEmail: string;
  password: string;
  gymId: number | null;
  gymName: string;
}




@Component({
  selector: 'app-admin-onboard',
  standalone: false,
  templateUrl: './admin-onboard.component.html',
  styleUrls: ['./admin-onboard.component.css']
})
export class AdminOnboardComponent implements OnInit {
  constructor(private memberService: MemberService) {}
  rolesList: Role[] = [];
  showDialog: boolean = false;
  userrole: string = 'superadmin'; // fetch from auth service
  isEditMode: boolean = false;   // ✅ Add/Edit mode flag
  canViewPasswords: boolean = false;   // 🔑 Controls password visibility access
passwordVisible: boolean = false;    // 👁 Toggle actual input visibility
manualGymEntry: boolean = false;
showPasswordDialog: boolean = false;
deleteDialogVisible: boolean = false;
roleToDelete: any = null;
deleteConfirmationText: string = '';

  admin = {
    roleId: 0,             // optional, 0 for new
    roleName: '',           // Admin/User/Superadmin
    userName: '',
    email: '',          // note the correct field name
    password: '',
    gymId: null as number | null,
    gymName: ''
  };
  

  availableGyms: { id: number; name: string }[] = [];

  rolesDropdown = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
    { label: 'Superadmin', value: 'superadmin' }
  ];

  ngOnInit() {
    this.fetchGyms();
    this.loadRoles();

  }
  
  openAddAdminDialog() {
    this.isEditMode = false;
    this.passwordVisible = false;
    this.manualGymEntry = false;
    this.resetAdmin();   // clear old data
    this.showDialog = true;
    
  }
  
  confirmDeleteRole(role: any) {
    this.roleToDelete = role;
    this.deleteDialogVisible = true;
    this.deleteConfirmationText = '';
  }
  // Fetch gyms dynamically (like fetchMembersFromAPI)
  fetchGyms() {
    if (this.userrole === 'superadmin') {
      this.memberService.getAllrole().subscribe({
        next: (data: any[]) => this.processGyms(data),
        error: (err) => console.error('Failed to fetch members:', err),
      });
    }
  }


  private processGyms(data: any[]) {
    const gymMap = new Map<number, string>();
    data.forEach(m => {
      if (m.GymId && m.GymName) {
        gymMap.set(m.GymId, m.GymName);
      }
    });
    this.availableGyms = Array.from(gymMap.entries()).map(([id, name]) => ({ id, name }));
  }
  // ✅ Edit Role
  editRole(role: Role) {
    this.isEditMode = true;
    this.passwordVisible = false;
    this.manualGymEntry = false;
    this.admin = { 
      roleId: role.roleId,
      roleName: role.roleName,
      userName: role.userName,
      email: role.userEmail,
      password: role.password,   // leave empty, only update if user enters new one
      gymId: role.gymId,
      gymName: role.gymName
    };
    this.showDialog = true;
  }
  onGymChange(selectedGymId: number) {
    const gym = this.availableGyms.find(g => g.id === selectedGymId);
    if (gym) {
      this.admin.gymId = gym.id;  // ✅ keep number type
      this.admin.gymName = gym.name;
    }
  }

  saveAdmin() {
    if (!this.admin.roleName || !this.admin.userName || !this.admin.email || !this.admin.password || !this.admin.gymName) {
      alert('Please fill all required fields');
      return;
    }
  
    const payload = {
      roleId: 0,                    // new admin
      roleName: this.admin.roleName,
      userName: this.admin.userName,
      userEmail: this.admin.email, // ✅ matches Swagger
      password: this.admin.password,
      gymId: this.admin.gymId,
      gymName: this.admin.gymName
    };
  
    this.memberService.addRole(payload).subscribe({
      next: (res) => {
        console.log('Admin saved:', res);
  
        // ✅ Refresh the roles list
        this.loadRoles();
  
        this.showDialog = false;
  
        // Reset form
        this.admin = { 
          roleId: 0, 
          roleName: '', 
          userName: '', 
          email: '', 
          password: '', 
          gymId: null, 
          gymName: '' 
        };
      },
      error: (err) => console.error('Failed to save admin:', err)
    });
  }
  
  updateAdmin() {
    const payload = {
      roleId: this.admin.roleId,
      roleName: this.admin.roleName,
      userName: this.admin.userName,
      userEmail: this.admin.email,  // ✅ keep consistent
      password: this.admin.password,
      gymId: this.admin.gymId,
      gymName: this.admin.gymName
    };
    
    this.memberService.updateRole(this.admin.roleId, payload).subscribe({
      next: (res: any) => {
        // 👇 map backend response to Role interface
        const updatedRole = {
          roleId: res.RoleId,
          roleName: res.RoleName,
          userName: res.UserName,
          userEmail: res.UserEmail,
          gymId: res.GymId,
          gymName: res.GymName
        } as Role;
  
        const index = this.rolesList.findIndex(r => r.roleId === this.admin.roleId);
        if (index !== -1) this.rolesList[index] = updatedRole;
        this.rolesList.sort((a, b) => a.roleId - b.roleId);
  
        // ✅ Refresh full list from backend after successful update
        this.loadRoles();
  
        this.showDialog = false;
        this.resetAdmin();
        this.isEditMode = false;
      },
      error: (err) => console.error('Failed to update admin:', err)
    });
  }
  
  

  // ✅ Delete Role
  deleteRole() {
    if (this.deleteConfirmationText.trim().toLowerCase() === 'delete') {
      this.memberService.deleteRole(this.roleToDelete.roleId).subscribe({
        next: () => {
          // Remove from local list
          this.rolesList = this.rolesList.filter(r => r.roleId !== this.roleToDelete.roleId);
  
          // Reset dialog
          this.deleteDialogVisible = false;
          this.roleToDelete = null;
          this.deleteConfirmationText = '';
        },
        error: (err) => {
          console.error('Failed to delete role:', err);
        }
      });
    }
  }
  private resetAdmin() {
    this.admin = { roleId: 0, roleName: 'admin', userName: '', email: '', password: '', gymId: null, gymName: '' };
  }
  loadRoles() {
    this.memberService.getRoles().subscribe({
      next: (data: any[]) => {
        console.log('API response:', data);
  
        this.rolesList = data.map(r => ({
          roleId: r.roleId ?? r.RoleId,
          roleName: r.roleName ?? r.RoleName,
          userName: r.userName ?? r.UserName,
          userEmail: r.userEmail ?? r.UserEmail,
          password: r.password ?? r.Password,   // ✅ include if backend sends it
          gymId: r.gymId ?? r.GymId,
          gymName: r.gymName ?? r.GymName
        })).sort((a, b) => a.roleId - b.roleId); // 👈 numeric sort
      },
      error: err => console.error('Failed to fetch roles', err)
    });
  }
  
    
  
}
