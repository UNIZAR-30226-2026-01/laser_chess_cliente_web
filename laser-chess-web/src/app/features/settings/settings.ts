import { Component, inject, signal, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TopRow } from '../../shared/top-row/top-row';
import { UserRespository } from '../../repository/user-respository';
import { AuthRepository } from '../../repository/auth-repository';
import { passwordMatchValidator } from '../../auth/signin/signin';

@Component({
  selector: 'app-settings',
  imports: [TopRow, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private repo = inject(UserRespository);
  private auth = inject(AuthRepository);

  // Popups
  popupPassword = signal(false);
  popupEmail = signal(false);
  popupSuccess = signal(false);
  showError = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  // Formularios
  changePasswordForm!: FormGroup;
  changeEmailForm!: FormGroup;

  // Valores actuales
  currentEmail = signal('');
  notificationsEnabled = signal(this.repo.getNotificationEnabled());

  formSubmitted = signal(false);

  ngOnInit() {
    // Cargar email actual
    this.repo.getCurrentEmail().subscribe({
      next: email => this.currentEmail.set(email),
      error: () => this.errorMessage.set('No se pudo cargar el email')
    });

    // Formulario cambio contraseña
    this.changePasswordForm = new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: passwordMatchValidator });

    // Formulario cambio email
    this.changeEmailForm = new FormGroup({
      newEmail: new FormControl('', [Validators.required, Validators.email])
    });
  }


  // Cambiar contraseña
  onSubmitPassword() {
    this.formSubmitted.set(true);
    if (this.changePasswordForm.invalid) return;

    const { oldPassword, newPassword } = this.changePasswordForm.value;
    this.repo.changePassword(oldPassword, newPassword).subscribe({
      next: () => {
        this.popupPassword.set(false);
        this.successMessage.set('Contraseña cambiada correctamente');
        this.popupSuccess.set(true);
        this.changePasswordForm.reset();
        this.formSubmitted.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Error al cambiar contraseña');
        this.showError.set(true);
      }
    });
  }

  // Cambiar email
  onSubmitEmail() {
    if (this.changeEmailForm.invalid) return;
    const newEmail = this.changeEmailForm.value.newEmail;
    this.repo.changeEmail(newEmail).subscribe({
      next: () => {
        this.currentEmail.set(newEmail);
        this.popupEmail.set(false);
        this.successMessage.set('Email actualizado correctamente');
        this.popupSuccess.set(true);
        this.changeEmailForm.reset();
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Error al cambiar email');
        this.showError.set(true);
      }
    });
  }

  // Eliminar cuenta (con confirmación)
  deleteAccount() {
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      this.repo.deleteAccount().subscribe({
        next: () => {
          this.auth.logout(); // Cierra sesión después de eliminar
        },
        error: (err) => {
          this.errorMessage.set(err.message || 'Error al eliminar cuenta');
          this.showError.set(true);
        }
      });
    }
  }

  logout() {
    this.auth.logout();
  }

  // Alternar notificaciones
  toggleNotifications(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.repo.setNotificationEnabled(checked);
    this.notificationsEnabled.set(checked);
  }
}