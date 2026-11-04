import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MultiSelectModule } from 'primeng/multiselect';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServiceAllService } from '../../../Services/service-all.service';
import { IdIsraelValidator } from '../../../Services/israel_ID';
import { SrvCities } from '../../../Services/srv-cities.service';
import { PhoneValidatorService } from '../../../Services/phone_validator';
import { PasswordvalidatorService } from '../../../Services/Password_validator';
import { Srv_Guide } from '../../../Services/srv-guide.service';
import { MatDialogRef } from '@angular/material/dialog';
import { regionNamePipe } from "../../../Pipes/regionName";
import { AuthService } from '../../../Services/auth-service.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-guide-registrations',
  imports: [
    MatIcon,
    ReactiveFormsModule,
    MultiSelectModule,
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    regionNamePipe
  ],
  templateUrl: './guide-registrations.component.html',
  styleUrl: './guide-registrations.component.scss',
  standalone: true,
})
export class GuideRegistrationsComponent {
  AreasOfExpertises: any[] = [];
  cities: string[] = [];
  filteredCities: string[] = [];
  showPassword = false;
  CertificatesFiles: File[] = [];
  resumeFiles: File | null = null;
  userIdExist: number = 0;
  guideIdExist: number = 0;
  religiousData: any[] = [];


  constructor(
    private dialogRef: MatDialogRef<GuideRegistrationsComponent>,
    private router: Router,
    public srv_all: ServiceAllService,
    private srvCities: SrvCities,
    public srv_guides: Srv_Guide,
    public authService: AuthService,
    public http: HttpClient
  ) {
    this.srv_all.getRegionsArray().subscribe((areas) => {
      this.AreasOfExpertises = areas;
      this.srv_all.getreligiousArray().subscribe((religious: any[]) => {
        this.religiousData = religious;
      });
    });
  }
  private phoneValidatorSrv = inject(PhoneValidatorService);

  phoneValidator = this.phoneValidatorSrv.phoneValidator;
  private IdIsrael = inject(IdIsraelValidator);

  private PasswordvalidatorSrv = inject(PasswordvalidatorService);
  passwordValidator = this.PasswordvalidatorSrv.passwordValidator;

  ngOnInit() {
    this.srvCities.getData().subscribe((cities) => {
      this.cities = cities;
      this.filteredCities = this.cities;
    });
  }

  IsraelIdValidator = this.IdIsrael.idValidator();

  formGuide = new FormGroup({
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
      this.IsraelIdValidator,
    ]),
    PhoneNumber: new FormControl('', [
      Validators.required,
      this.phoneValidator,
    ]),
    Email: new FormControl('', [Validators.required, Validators.email]),
    UserPassword: new FormControl('', [
      Validators.required,
      this.passwordValidator,
    ]),
    CityId: new FormControl('', [Validators.required]),
    ReligiousId: new FormControl('', [Validators.required]),
    selectedAreasOfExpertises: new FormControl<number[]>(
      [],
      [Validators.required],
    ),
    CertificatesFiles: new FormControl<File[]>([]), // קבצי תעודות (מרובים)
    resumeFiles: new FormControl<File | null>(null), // קורות חיים (קובץ אחד)
  });

  // religiousData = [
  //   { id: 1, name: 'חסידי' },
  //   { id: 2, name: 'ספרדי' },
  //   { id: 3, name: 'אשכנזי' },
  //   { id: 4, name: 'אחר' },
  // ];

  newGuide() {
    const selectedCity = this.formGuide.get('CityId')?.value;
    if (!selectedCity || !this.filteredCities.includes(selectedCity)) {
      alert('אנא בחר עיר מהרשימה.');
      return;
    }

    if (this.formGuide.invalid) {
      console.error('טופס לא תקין:', this.formGuide.errors);
      return;
    }

    const formValue = this.formGuide.value;
    const certificatesFiles = (formValue.CertificatesFiles as File[]) || [];
    const resumeFile = (formValue.resumeFiles as File) || null;
    const regionIds = (formValue.selectedAreasOfExpertises as number[]) || [];

    // בניית ה-payload המלא — כולל פרטי המשתמש (מהם השרת יוצר/מעדכן את ה-User)
    // + עדה + אזורי התמחות ("המקומות שהיא מדריכה בהם") + קבצים.
    const payload = {
      FirstName: formValue.FirstName || '',
      LastName: formValue.LastName || '',
      IdNumber: formValue.IdNumber || '',
      City: selectedCity,
      PhoneNumber: formValue.PhoneNumber || '',
      Email: formValue.Email || '',
      UserPassword: formValue.UserPassword || '',
      ReligiousId: Number(formValue.ReligiousId) || 0,
      RegionIds: regionIds,
      ResumeFile: resumeFile,
      CertificateFiles: certificatesFiles,
    };

    // שמירת המשתמש + המדריך + הקבצים לשרת (GuideId ו-UserId נקבעים ע"י השרת)
    this.srv_guides.addGuide(payload).subscribe((res) => {
      console.log('Guide Data שמור:', payload, res);
      if (!res) {
        alert('אירעה שגיאה בשמירת המדריכה. נא לנסות שוב.');
        return;
      }
      // השרת מחזיר guideId וגם regionIds ("המקומות שהיא מדריכה בהם")
      console.log('GuideId:', res.guideId, 'RegionIds:', res.regionIds);

      // הכנסת הנתונים ב-LOCAL STORAGE
      // const userObj = { email: payload.Email, userId: res.userId };
      // localStorage.setItem('user_data', JSON.stringify(userObj));
      const aaa = 'https://localhost:7098/api/Login/login';
      const userInput = {
        Email: payload.Email,
        UserPassword: payload.UserPassword,
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
      this.formGuide.reset();
      this.dialogRef.close();
    });
  }

  PasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files) {
      const files = Array.from(input.files);

      this.formGuide.get('CertificatesFiles')?.setValue(files);

      this.CertificatesFiles = files;
    }
  }



  onOneFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // 1. לטופס
      this.formGuide.get('resumeFiles')?.setValue(file);

      // 2. לתצוגה
      this.resumeFiles = file;
    }
  }

  filterCity(event: Event) {
    const input = event.target as HTMLInputElement;
    const cityToFilter = input.value.toLowerCase();
    this.filteredCities = this.cities.filter((city) =>
      city.toLowerCase().includes(cityToFilter),
    );
  }


  onCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const control = this.formGuide.get('selectedAreasOfExpertises');

    let current: number[] = control?.value ?? [];

    if (checkbox.checked) {
      current = [...current, Number(checkbox.value)];
    } else {
      current = current.filter((x) => x !== Number(checkbox.value));
    }

    control?.setValue(current);
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }


  isChecked(num: number): boolean {
    const selected =
      this.formGuide.get('selectedAreasOfExpertises')?.value ?? [];
    return selected.includes(num);
  }

  searchGuide() {
    const numberId = this.formGuide.get('IdNumber');
    if (numberId?.invalid) return;

    const idNumber = String(this.formGuide.value.IdNumber);
    const guideDetails = this.getGuideDetailsByIdNumber(idNumber);

    console.log('idNmber: ', idNumber);
    console.log(guideDetails);

    if (guideDetails == null) {
      this.CertificatesFiles = [];
      this.resumeFiles = null;
      this.formGuide.get('resumeFiles')?.setValue(null);
      this.formGuide.get('CertificatesFiles')?.setValue([]);
      this.formGuide.get('selectedAreasOfExpertises')?.setValue([]);
      this.formGuide.get('ReligiousId')?.setValue('');
      this.guideIdExist = 0;
      this.userIdExist = 0;
      return;
    }

    this.guideIdExist = guideDetails.guideId;
    this.userIdExist = guideDetails.userId;
    this.resumeFiles = guideDetails.resumeFiles;
    this.CertificatesFiles = guideDetails.CertificatesFiles;
    this.formGuide
      .get('ReligiousId')
      ?.setValue(String(guideDetails.religiousId));
    this.formGuide
      .get('selectedAreasOfExpertises')
      ?.setValue(guideDetails.regionId ?? []);
  }

  private getGuideDetailsByIdNumber(idNumber: string): any | null {
    const guideService = this.srv_guides as any;

    if (typeof guideService.getGuideDetailsByIdNumber === 'function') {
      return guideService.getGuideDetailsByIdNumber(idNumber);
    }

    if (typeof guideService.GetGuideByIdNumber === 'function') {
      return guideService.GetGuideByIdNumber(idNumber);
    }

    if (typeof guideService.GetGuideById === 'function') {
      return guideService.GetGuideById(idNumber);
    }

    if (Array.isArray(guideService.guides)) {
      return (
        guideService.guides.find((guide: any) => guide.idNumber === idNumber) ??
        null
      );
    }

    return null;
  }
}
