import { Component, inject, Input, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { ServiceUsersService } from '../../../Services/srv-users';
import { ServiceCoordinatorService } from '../../../Services/service-coordinator.service';
import { SrvSchoolService } from '../../../Services/srv-school.service';
import { IdIsraelValidator } from '../../../Services/israel_ID';
import { PhoneValidatorService } from '../../../Services/phone_validator';
import { PasswordvalidatorService } from '../../../Services/Password_validator';
import { SrvCities } from '../../../Services/srv-cities.service';
import { InterfaceSchool } from '../../../Interfaces/interface-school';
import { CoordinatorRegisterPayload } from '../../../Interfaces/int-coordinator';
import { ServiceAllService } from '../../../Services/service-all.service';
import { AuthService } from '../../../Services/auth-service.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-coordinator-registrations',
  imports: [ReactiveFormsModule, MatIconModule, DropdownModule, CardModule],
  templateUrl: './coordinator-registrations.component.html',
  styleUrls: ['./coordinator-registrations.component.scss'],
  standalone: true,
})
export class CoordinatorRegistrationsComponent {
  lastUserId: number | undefined;
  lastCoordinatorId: number | undefined;
  // lastSchoolId: number | undefined;

  // chooseSchool : boolean = false

  cities: string[] = [];
  filteredCities: string[] = [];

  schools: InterfaceSchool[] = [];
  filteredSchools: InterfaceSchool[] = [];

  RoleIdData: any[] = [];
  religiousData: any[] = [];

  constructor(
    private srvUsers: ServiceUsersService,
    private srv_Coordinators: ServiceCoordinatorService,
    private srvSchools: SrvSchoolService,
    private router: Router,
    private dialogRef: MatDialogRef<CoordinatorRegistrationsComponent>,
    private srvCities: SrvCities,
    public srv_all : ServiceAllService,
    public authService: AuthService,
    public http: HttpClient
  ) {
      // טעינת רשימת התפקידים ורשימת סוגי המוסד/העדות מהשרת
      this.srv_all.getRolesArray().subscribe((roles: any[]) => {
        this.RoleIdData = roles;
      });

      this.srv_all.getreligiousArray().subscribe((religious: any[]) => {
        this.religiousData = religious;
      });
  }

  private IdIsrael = inject(IdIsraelValidator);
  IsraelIdValidator = this.IdIsrael.idValidator;

  private phoneValidatorSrv = inject(PhoneValidatorService);
  phoneValidator = this.phoneValidatorSrv.phoneValidator;

  private PasswordvalidatorSrv = inject(PasswordvalidatorService);
  passwordValidator = this.PasswordvalidatorSrv.passwordValidator;

  ngOnInit() {
    this.lastUserId = this.srvUsers.GetLastUserId() + 1;
    this.lastCoordinatorId =
      this.srv_Coordinators.GetLastTourCoordinatorId() + 1;
    // this.lastSchoolId = this.srvSchools.GetLastSchoolId() + 1;

    this.srvCities.getData().subscribe((cities) => {
      this.cities = cities;
      this.filteredCities = this.cities;
    });
    console.log("רשימת הערים: ", this.cities);

    this.schools = this.srvSchools.GetSchools();

    this.filteredSchools = this.schools;
  }

 
  AgeSchoolIdData = [
    { id: 1, name: 'יסודי' },
    { id: 2, name: 'חט"ב' },
    { id: 3, name: 'תיכון' },
    { id: 4, name: 'אחר' },
  ];

  formCoordinator = new FormGroup({
    UserPassword: new FormControl('', [
      Validators.required,
      this.passwordValidator,
    ]),
    FirstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    LastName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    IdNumber: new FormControl('', [
      Validators.required,
      this.IdIsrael.idValidator(),
    ]),
    CityId: new FormControl('', [Validators.required]),
    PhoneNumber: new FormControl('', [
      Validators.required,
      this.phoneValidator,
    ]),
    Email: new FormControl('', [Validators.required, Validators.email]),
    RoleId: new FormControl('', [Validators.required]),
    SchoolName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    IsBoys: new FormControl('', [Validators.required]),
    PrincipalName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),

    PhoneSecretary: new FormControl('', [
      Validators.required,
      this.phoneValidator,
    ]),
    TypeSchoolId: new FormControl('', [Validators.required]),
    AgeSchoolId: new FormControl('', [Validators.required]),
  });

  newCoordinator() {
    const selectedCity = this.formCoordinator.get('CityId')?.value;

    if (!selectedCity || !this.filteredCities.includes(selectedCity)) {
      alert('אנא בחר עיר מהרשימה.');
      return;
    }

    const selectedSchool = this.formCoordinator.get('SchoolName')?.value || '';
    const schoolExists = this.filteredSchools.some(
      (school) => school.SchoolName === selectedSchool,
    );
    const needToAddSchool = !schoolExists;

    let schoolIdToSave;
    if (selectedSchool && this.srvSchools.ExistsCity(selectedSchool) != 0) {
      schoolIdToSave = this.srvSchools.ExistsCity(selectedSchool);
    } else {
      schoolIdToSave = this.srvSchools.GetLastSchoolId() + 1;
    }

    if (this.formCoordinator.valid) {
      // בניית נתוני הרישום — נשלחים לשרת בפעולה אחת.
      // שם העיר נשלח כ-string (ללא טבלת City), וה-Identity של השרת מייצר את המזהים.
      const payload: CoordinatorRegisterPayload = {
        firstName: this.formCoordinator.get('FirstName')?.value || '',
        lastName: this.formCoordinator.get('LastName')?.value || '',
        idNumber: this.formCoordinator.get('IdNumber')?.value || '',
        city: selectedCity,
        phoneNumber: this.formCoordinator.get('PhoneNumber')?.value ?? '',
        email: this.formCoordinator.get('Email')?.value || '',
        userPassword: this.formCoordinator.get('UserPassword')?.value || '',
        roleId: Number(this.formCoordinator.get('RoleId')?.value),
        // מוסד קיים → schoolId; מוסד חדש → null (והפרטים למטה)
        schoolId: needToAddSchool ? null : schoolIdToSave,
      };

      if (needToAddSchool) {
        payload.schoolName =
          this.formCoordinator.get('SchoolName')?.value || '';
        payload.isBoys = Number(this.formCoordinator.get('IsBoys')?.value) === 1;
        payload.schoolCity = selectedCity;
        payload.principalName =
          this.formCoordinator.get('PrincipalName')?.value || '';
        payload.phoneSecretary =
          this.formCoordinator.get('PhoneSecretary')?.value || '';
        payload.typeSchoolId = Number(
          this.formCoordinator.get('TypeSchoolId')?.value,
        );
        payload.ageSchoolId = Number(
          this.formCoordinator.get('AgeSchoolId')?.value,
        );
      }

      console.log('Payload רישום כורדינטור:', payload);

      this.srv_Coordinators
        .registerCoordinator(payload)
        .subscribe((res: any) => {
          const userId = res?.userId;
          console.log('רישום הצליח, userId:', userId);

          // שמירת פרטי המשתמש ב-LOCAL STORAGE לפי ה-ID שקיבלנו מהשרת
          // const userObj = { email: payload.email, userId };
          // localStorage.setItem('user_data', JSON.stringify(userObj));

          // this.formCoordinator.reset();
          // this.dialogRef.close(); // סגור את הדיאלוג
          // this.router.navigate(['welcome/Home_Page']);
          const aaa = 'https://localhost:7098/api/Login/login';
      const userInput = {
        Email: payload.email,
        UserPassword: payload.userPassword,
      };

      this.http.post<any>(aaa, userInput).subscribe(
        response => {
          console.log('User found:', response);

          if (response) {
            // מפענח את ה-JWT ושומר את מלא פרטי המשתמש
            // (firstName, userId, email, permission) ב-LOCAL STORAGE
            this.authService.login(response.token);


            this.router.navigate(['welcome/Home_Page']);
          } else {
            alert('אירעה שגיאה בהתחברות לאחר ההרשמה. נא לנסות שוב.');
          }
        },
        error => {
          alert('אירעה שגיאה בהתחברות לאחר ההרשמה. נא לנסות שוב.');
        }


      );
      this.formCoordinator.reset();
      this.dialogRef.close();
    });

    } else {
      console.error('טופס לא תקין:', this.formCoordinator.errors);
    }
  }

  showPassword = false;
  PasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  filterCity(event: Event) {
    const input = event.target as HTMLInputElement;
    const cityToFilter = input.value.toLowerCase();

    this.filteredCities = this.cities.filter((city) =>
      city.toLowerCase().includes(cityToFilter),
    );
  }

  filterSchool(event: Event) {
    const input = event.target as HTMLInputElement;
    const schoolToFilter = input.value.toLowerCase();

    this.filteredSchools = this.schools.filter((school) =>
      school.SchoolName.toLowerCase().includes(schoolToFilter),
    );
  }

  SearchInList(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value; // קבלת ערך השדה
    const foundSchool = this.filteredSchools.find(
      (school) => school.SchoolName === inputValue,
    );

    if (!foundSchool) {
      this.formCoordinator.get('PrincipalName')?.setValue('');
      this.formCoordinator.get('IsBoys')?.setValue('');
      this.formCoordinator.get('CityId')?.setValue('');
      this.formCoordinator.get('PhoneSecretary')?.setValue('');
      this.formCoordinator.get('TypeSchoolId')?.setValue('');
      this.formCoordinator.get('AgeSchoolId')?.setValue('');
      this.setSchoolFieldsEnabled(true); // אם לא נמצא מוסד, השבת שדות
      return;
    }

    this.formCoordinator
      .get('PrincipalName')
      ?.setValue(foundSchool.PrincipalName || '');
    this.formCoordinator
      .get('IsBoys')
      ?.setValue(foundSchool.IsBoys != null ? String(foundSchool.IsBoys) : '');
    this.formCoordinator
      .get('CityId')
      ?.setValue(
        foundSchool.CityId != null
          ? String(this.srvCities.getCityById(foundSchool.CityId))
          : '',
      );
    this.formCoordinator
      .get('PhoneSecretary')
      ?.setValue(foundSchool.PhoneSecretary || '');
    this.formCoordinator
      .get('TypeSchoolId')
      ?.setValue(
        foundSchool.TypeSchoolId != null
          ? String(foundSchool.TypeSchoolId)
          : '',
      );
    this.formCoordinator
      .get('AgeSchoolId')
      ?.setValue(
        foundSchool.AgeSchoolId != null ? String(foundSchool.AgeSchoolId) : '',
      );

    this.setSchoolFieldsEnabled(false); // אם נמצא מוסד, אפשר את השדות
  }

  setSchoolFieldsEnabled(enabled: boolean) {
    if (enabled) {
      this.formCoordinator.get('PhoneSecretary')?.enable();
      this.formCoordinator.get('PrincipalName')?.enable();
      this.formCoordinator.get('IsBoys')?.enable();
      this.formCoordinator.get('CityId')?.enable();
      this.formCoordinator.get('TypeSchoolId')?.enable();
      this.formCoordinator.get('AgeSchoolId')?.enable();
    } else {
      this.formCoordinator.get('PhoneSecretary')?.disable();
      this.formCoordinator.get('PrincipalName')?.disable();
      this.formCoordinator.get('IsBoys')?.disable();
      this.formCoordinator.get('CityId')?.disable();
      this.formCoordinator.get('TypeSchoolId')?.disable();
      this.formCoordinator.get('AgeSchoolId')?.disable();
    }
  }
}
