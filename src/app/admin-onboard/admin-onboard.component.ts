import { Component, OnInit } from '@angular/core';
import { MemberService } from '../services/member.service'; 
import Swal from 'sweetalert2';

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
filteredRolesList: Role[] = []; // ✅ Filtered list for search

  searchTerm: string = '';         // ✅ Search input 

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
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill all required fields.',
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#d63031'
      });
      return;
    }
  
    const payload = {
      roleId: 0,
      roleName: this.admin.roleName,
      userName: this.admin.userName,
      userEmail: this.admin.email,
      password: this.admin.password,
      gymId: this.admin.gymId,
      gymName: this.admin.gymName
    };
  
    this.memberService.addRole(payload).subscribe({
      next: (res) => {
        this.loadRoles();
        this.showDialog = false;
        this.resetAdmin();
  
        Swal.fire({
          icon: 'success',
          title: 'Admin Added!',
          text: 'The admin has been created successfully.',
          background: '#1e1e1e',
          color: '#f5f5f5',
          confirmButtonColor: '#00b894',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.handleError(err, 'Failed to save admin');
      }
    });
  }
  
  
  updateAdmin() {
    const payload = {
      roleId: this.admin.roleId,
      roleName: this.admin.roleName,
      userName: this.admin.userName,
      userEmail: this.admin.email,
      password: this.admin.password,
      gymId: this.admin.gymId,
      gymName: this.admin.gymName
    };
  
    this.memberService.updateRole(this.admin.roleId, payload).subscribe({
      next: () => {
        this.loadRoles();
        this.showDialog = false;
        this.resetAdmin();
        this.isEditMode = false;
  
        Swal.fire({
          icon: 'success',
          title: 'Admin Updated!',
          text: 'The admin details were updated successfully.',
          background: '#1e1e1e',
          color: '#f5f5f5',
          confirmButtonColor: '#00b894',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.handleError(err, 'Failed to update admin');
      }
    });
  }
  
  
  

  // ✅ Delete Role
  deleteRole() {
    if (this.deleteConfirmationText.trim().toLowerCase() === 'delete') {
      this.memberService.deleteRole(this.roleToDelete.roleId).subscribe({
        next: () => {
          this.rolesList = this.rolesList.filter(r => r.roleId !== this.roleToDelete.roleId);
          this.deleteDialogVisible = false;
          this.roleToDelete = null;
          this.deleteConfirmationText = '';
          this.loadRoles();
  
          Swal.fire({
            icon: 'success',
            title: 'Role Deleted!',
            text: 'The role has been deleted successfully.',
            background: '#1e1e1e',
            color: '#f5f5f5',
            confirmButtonColor: '#00b894',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.handleError(err, 'Failed to delete role');
        }
      });
    }
  }
  private handleError(err: any, fallbackMessage: string) {
    let messages: string[] = [];
  
    if (err.error?.errors) {
      messages = Object.values(err.error.errors)
        .flat()
        .map(e => String(e));
    } else if (err.error?.title) {
      messages = [err.error.title];
    } else {
      messages = [fallbackMessage];
    }
  
    Swal.fire({
      icon: 'error',
      title: 'Error',
      html: messages.join('<br>'),
      background: '#1e1e1e',
      color: '#f5f5f5',
      confirmButtonColor: '#d63031',
      customClass: { popup: 'swal2-popup-front' }
    });
  }
  
  private resetAdmin() {
    this.admin = { roleId: 0, roleName: 'admin', userName: '', email: '', password: '', gymId: null, gymName: '' };
  }
  loadRoles() {
    this.memberService.getRoles().subscribe({
      next: (data: any[]) => {
        console.log('API response:', data);
        this.processGyms(data)
        this.rolesList = data.map(r => ({
          roleId: r.roleId ?? r.RoleId,
          roleName: r.roleName ?? r.RoleName,
          userName: r.userName ?? r.UserName,
          userEmail: r.userEmail ?? r.UserEmail,
          password: r.password ?? r.Password,   // ✅ include if backend sends it
          gymId: r.gymId ?? r.GymId,
          gymName: r.gymName ?? r.GymName
        })).sort((a, b) => a.roleId - b.roleId); // 👈 numeric sort
        this.filteredRolesList = [...this.rolesList];
      },
      error: err => console.error('Failed to fetch roles', err)
    });
  }
  filterRoles() {
    this.applySearch();
  }

  private applySearch() {
    const term = this.searchTerm.trim().toLowerCase();
  
    if (!term) {
      // If search is empty, show all roles
      this.filteredRolesList = [...this.rolesList];
      return;
    }
  
    this.filteredRolesList = this.rolesList.filter(role =>
      role.roleName?.toLowerCase().includes(term) ||
      role.userName?.toLowerCase().includes(term) ||
      role.userEmail?.toLowerCase().includes(term) ||
      (role.gymId !== null ? role.gymId.toString().includes(term) : false) ||
      role.gymName?.toLowerCase().includes(term)
    );
  }
  
  
}
