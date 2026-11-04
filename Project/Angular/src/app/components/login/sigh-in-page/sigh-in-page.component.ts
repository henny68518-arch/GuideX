import { Component, inject, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { CdkObserveContent } from '@angular/cdk/observers';
import { ServiceUsersService } from '../../../Services/srv-users';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { PasswordvalidatorService } from '../../../Services/Password_validator';
import { CheckerGuideOrCoordinatorComponent } from '../checker-guide-or-coordinator/checker-guide-or-coordinator.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../Services/auth-service.service';

@Component({
  selector: 'app-sigh-in-page',
  imports: [
    MatIcon,
    ReactiveFormsModule,
    MatDialogModule,
  ],
  templateUrl: './sigh-in-page.component.html',
  styleUrl: './sigh-in-page.component.scss',
  standalone: true,
})
export class SighInPageComponent {

 userNotFount = false

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<SighInPageComponent>,
    public users_service: ServiceUsersService,
    private router: Router,
    public http : HttpClient,
    public authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  private PasswordvalidatorSrv = inject(PasswordvalidatorService);
  passwordValidator = this.PasswordvalidatorSrv.passwordValidator;

  // ngOnInit(){
  //   this.users_service.aaa()
  // }

  onClose() {
    this.dialogRef.close();
  }

  formLogIn = new FormGroup({
    UserPassword: new FormControl('', [
      Validators.required,
      this.passwordValidator,
    ]),
    Email: new FormControl('', [Validators.required, Validators.email]),
  });

  showPassword = false;
  PasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


login() {
    const aaa = 'https://localhost:7098/api/Login/login';
    const userInput = {
        Email: this.formLogIn.get('Email')?.value,
        UserPassword: this.formLogIn.get('UserPassword')?.value
    };

    this.http.post<any>(aaa, userInput).subscribe(
        response => {
            console.log('User found:', response);
            
            // בדוק אם נמצא משתמש
            if (response) {
                // מפענח את ה-JWT ושומר את מלא פרטי המשתמש
                // (firstName, userId, email, permission) דרך ה-AuthService —
                // בלי שמירה ידנית כפולה של user_data ב-LOCAL STORAGE.
                this.authService.login(response.token);

                this.userNotFount = false;
                this.formLogIn.reset();
                this.onClose(); 
                this.router.navigate(['welcome/Home_Page']);
            } else {
                this.userNotFount = true;
            }
        },
        error => {
            this.userNotFount = true;
        }
    );
}

  changeInput(){
    this.userNotFount = false 
  }

  openReset() {
    this.onClose();
    const dialogRef = this.dialog.open(ResetPasswordComponent, {
      width: '950px',
      data: {},
    });
  }


  openDialogRegistrations() {
    this.onClose();
      const dialogRef = this.dialog.open(CheckerGuideOrCoordinatorComponent, {
        width: '950px',
        data: {},
      });
    }
}
