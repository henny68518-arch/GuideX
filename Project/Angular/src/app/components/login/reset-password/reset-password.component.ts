import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { IdIsraelValidator } from '../../../Services/israel_ID';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ServiceUsersService } from '../../../Services/srv-users';
import { PhoneValidatorService } from '../../../Services/phone_validator';
import { PasswordvalidatorService } from '../../../Services/Password_validator';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SighInPageComponent } from '../sigh-in-page/sigh-in-page.component';

@Component({
  selector: 'app-reset-password',
  imports: [MatIcon, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  standalone: true,
})
export class ResetPasswordComponent {
  private IdIsrael = inject(IdIsraelValidator);

  IsraelIdValidator = this.IdIsrael.idValidator();

  findUserInList: boolean = false;
  notExistsUser: boolean = false;
  findUser: any;

  constructor(
    public dialogRef: MatDialogRef<ResetPasswordComponent>,
    public srv_users: ServiceUsersService,
    public router: Router,
    public http : HttpClient,
        public dialog: MatDialog,

  ) {}

  private PasswordvalidatorSrv = inject(PasswordvalidatorService);
  passwordValidator = this.PasswordvalidatorSrv.passwordValidator;

  private phoneValidatorSrv = inject(PhoneValidatorService);
  phoneValidator = this.phoneValidatorSrv.phoneValidator;

  ResetPassword = new FormGroup({
    Email: new FormControl('', [Validators.required, Validators.email]),
    PhoneNumber: new FormControl('', [
      Validators.required,
      this.phoneValidator,
    ]),

    IdNumber: new FormControl('', [
      Validators.required,
      this.IsraelIdValidator,
    ]),
    UserPassword: new FormControl('', [
      Validators.required,
      this.passwordValidator,
    ]),
    UserRepeatPassword: new FormControl('', [
      Validators.required,
      this.passwordValidator,
    ]),
  });

  showPasswordFirst = false;
  PasswordFirstVisibility() {
    this.showPasswordFirst = !this.showPasswordFirst;
  }
  showPasswordSecond = false;
  PasswordSVisibility() {
    this.showPasswordSecond = !this.showPasswordSecond;
  }

  onClose(): void {
    this.dialogRef.close();
  }
  reset() {
    const email = this.ResetPassword.get('Email')?.value;
    const phoneNumber = this.ResetPassword.get('PhoneNumber')?.value;
    const idNumber = this.ResetPassword.get('IdNumber')?.value;
    const EmPhId: any = {
      Email: email,
      PhoneNumber: phoneNumber,
      idNumber: idNumber,
    };
    console.log("הגעתי לפה!!! עוד מעט אני אבצע קריאת שרת")
      const request: any = this.srv_users.getUserByEmailIdNumberPhone(EmPhId);

      if (request?.subscribe) {
        request.subscribe(
          (response: any) => {
            if (response) {
              console.log('User found: 111111: ', response);
              this.notExistsUser = true; // משתמש לא נמצא
              this.findUser = null;
            } else {
              this.findUserInList = true; // משתמש נמצא
              this.findUser = response; // שמור את התגובה
              this.findUser = true;
            }
          },
          (error: unknown) => {
            console.log("לא הצלחתי לבצע קריאת שרת");
            console.error('Error:', error);
          }
        );
      } else {
        console.error('getUserByEmailIdNumberPhone did not return an observable.');
      }
  }

  isAnyFieldValid(): boolean {
    return (
      !!this.ResetPassword.get('Email')?.valid &&
      !!this.ResetPassword.get('PhoneNumber')?.valid &&
      !!this.ResetPassword.get('IdNumber')?.valid
    );
  }

  isSamePassword(): boolean {
    const userPassword = this.ResetPassword.get('UserPassword')?.value;
    const userRepeatPassword =
      this.ResetPassword.get('UserRepeatPassword')?.value;

    return userPassword === userRepeatPassword;
  }

resetUserPassword() {
    if (this.findUser) {
      console.log('User found: asdsfadsf: ', this.findUser);
        const userEmail = this.findUser.email;
        const userId = this.findUser.userId;
        const userPassword = this.ResetPassword.get('UserPassword')?.value; 

        const userDetailsToReset = {
            Email: userEmail,
            PhoneNumber: this.ResetPassword.get('PhoneNumber')?.value,
            idNumber: this.ResetPassword.get('IdNumber')?.value,
            UserPassword: userPassword,
        };

        console.log('Data to reset password: ', userDetailsToReset);
        
        this.http.post<any>('https://localhost:7098/api/Login/resetPassword', userDetailsToReset).subscribe(
            response => {
                // טיפול בתגובה מהשרת
                if (response && response.message) {
                    console.log(response.message); // או להצגת הודעה למשתמש
                } else {
                    console.log('Unknown response from server');
                }
            },
            error => {
                // טיפול בשגיאה
                if (error.status === 404) {
                    console.error('User does not exist');
                    this.notExistsUser = true; // מייצר הודעה למשתמש
                } else {
                    console.error('An error occurred during password reset', error);
                    // אפשר להציג הודעת שגיאה כללית למשתמש
                }
            }
        );

        // ניקוי טופס ופתיחת דיאלוגים
        this.findUser = null;
        this.ResetPassword.reset();
        this.dialogRef.close(); // סגור את הדיאלוג
        this.openDialogLogin();
        this.router.navigate(['welcome/Home_Page']);
    } else {
        this.notExistsUser = true; // מייצר הודעה שמשתמש לא נמצא
    }
}
  
  userNotExists() {
    this.notExistsUser = false;
  }

    openDialogLogin() {
      const dialogRef = this.dialog.open(SighInPageComponent, {
        width: '950px',
        data: {},
      });
    }
}
