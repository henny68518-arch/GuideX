import { Component, Inject, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ServiceUsersService } from '../../Services/srv-users';
import { Srv_Guide } from '../../Services/srv-guide.service';
import { ServiceAllService } from '../../Services/service-all.service';
import { SrvCities } from '../../Services/srv-cities.service';
import { SrvSchoolService } from '../../Services/srv-school.service';
import { PhoneValidatorService } from '../../Services/phone_validator';
import { AuthService } from '../../Services/auth-service.service';

@Component({
  selector: 'app-edit-user-detail',
  imports: [ReactiveFormsModule, MatIcon, CommonModule],
  templateUrl: './edit-user-detail.component.html',
  styleUrl: './edit-user-detail.component.scss',
})
export class EditUserDetailComponent {
  // ── נתוני המשתמש והפרופיל ──
  userId: number | string | null = null;
  profile: any = null;
  profileType: '' | 'guide' | 'coordinator' | 'admin' = '';

  loading = true;
  saving = false;
  error = '';

  /**
   * מצב צפייה בלבד. נקבע על ידי הפותח דרך `data.readOnly`.
   * כשמופעל — הטופס מוצג לקריאה בלבד, אין כפתור שמירה,
   * וכל שליחה לשרת נחסמת (הגנה כפולה מעבר ל-disabled בתבנית).
   */
  readOnly = false;

  /** כותרת החלון: "עריכת הפרטים שלך" למשתמש עצמו, אחרת "פרטי משתמש". */
  get dialogTitle(): string {
    return this.readOnly ? 'פרטי משתמש' : 'עריכת הפרטים שלך';
  }

  regionBegin: any[] = [];

  // ── רשימות מילוי ──
  cities: string[] = [];
  filteredCities: string[] = [];
  religiousData: any[] = [];
  AreasOfExpertises: any[] = [];
  RoleIdData: any[] = [];
  schools: any[] = [];
  filteredSchools: any[] = [];
  AgeSchoolIdData = [
    { id: 1, name: 'יסודי' },
    { id: 2, name: 'חט"ב' },
    { id: 3, name: 'תיכון' },
    { id: 4, name: 'אחר' },
  ];

  // ── קבצים (מדריכה) ──
  CertificatesFiles: File[] = [];
  resumeFiles: File | null = null;

  /** הקבצים הקיימים של המדריכה (קורות חיים ותעודות) — להצגה בלבד. */
  existingFiles: {
    fileName: string;
    kind: 'Cv' | 'Certificate';
    url: string;
  }[] = [];

  private phoneValidatorSrv = inject(PhoneValidatorService);
  phoneValidator = this.phoneValidatorSrv.phoneValidator;

  constructor(
    public dialogRef: MatDialogRef<EditUserDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public srv_user: ServiceUsersService,
    public srv_guide: Srv_Guide,
    public srv_all: ServiceAllService,
    private srvCities: SrvCities,
    private srvSchools: SrvSchoolService,
    private authService: AuthService,

  ) {
    const saved = localStorage.getItem('user_data');
    const savedUser = saved ? JSON.parse(saved) : null;
    this.userId = this.data?.userId ?? savedUser?.userId ?? null;
    this.readOnly = this.data?.readOnly ?? false;
    console.log('EditUserDetailComponent initialized with userId:', this.userId);
  }

  // ── טופס מדריכה ──
  formGuide = new FormGroup({
    FirstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    LastName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    IdNumber: new FormControl({ value: '', disabled: true }),
    PhoneNumber: new FormControl('', [
      Validators.required,
      this.phoneValidator,
    ]),
    Email: new FormControl('', [Validators.required, Validators.email]),
    UserPassword: new FormControl({ value: '', disabled: true }),
    CityId: new FormControl('', [Validators.required]),
    ReligiousId: new FormControl('', [Validators.required]),
    selectedAreasOfExpertises: new FormControl<number[]>(
      [],
      [Validators.required],
    ),
  });

  // ── טופס רכזת/מוסד ──
  formCoordinator = new FormGroup({
    FirstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    LastName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    IdNumber: new FormControl({ value: '', disabled: true }),
    PhoneNumber: new FormControl('', [
      Validators.required,
      this.phoneValidator,
    ]),
    Email: new FormControl('', [Validators.required, Validators.email]),
    UserPassword: new FormControl({ value: '', disabled: true }),
    RoleId: new FormControl('', [Validators.required]),
    SchoolName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    IsBoys: new FormControl('', [Validators.required]),
    CityId: new FormControl('', [Validators.required]),
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

  // ── טופס משתמש בסיסי (מנהל) ──
  formUser = new FormGroup({
    FirstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    LastName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    IdNumber: new FormControl({ value: '', disabled: true }),
    PhoneNumber: new FormControl('', [
      Validators.required,
      this.phoneValidator,
    ]),
    Email: new FormControl('', [Validators.required, Validators.email]),
    UserPassword: new FormControl({ value: '', disabled: true }),
  });

  ngOnInit() {
    // טעינת רשימות העזר
    this.srv_all.getreligiousArray().subscribe((religious: any[]) => {
      this.religiousData = religious;
    });
    
    this.srv_all.getRegionsArray().subscribe((areas: any[]) => {
      this.AreasOfExpertises = areas;
    });
    this.srv_all.getRolesArray().subscribe((roles: any[]) => {
      this.RoleIdData = roles;
    });
    this.srvCities.getData().subscribe((cities: string[]) => {
      this.cities = cities;
      this.filteredCities = cities;
    });
    this.schools = this.srvSchools.GetSchools();
    this.filteredSchools = this.schools;
    this.loadProfile();
  }

  /** שולף את הפרופיל מהשרת לפי UserId וממלא את הטופס. */
  loadProfile() {

    if (!this.userId) {
      const saved = localStorage.getItem('user_data');
      const savedUser = saved ? JSON.parse(saved) : null;
      this.userId = this.data?.userId ?? savedUser?.userId ?? null;
    }
    if (this.userId == null) {
      this.error = 'לא נמצא משתמש מחובר לעריכה.';
      this.loading = false;
      return;
    }
    this.srv_user.getProfile(this.userId).subscribe((profile) => {
      this.loading = false;
      if (!profile || (profile.type !== 'guide' && profile.type !== 'coordinator')) {
        this.error = 'לא ניתן לטעון את הפרטים לעריכה.';
        return;
      }

      this.profile = profile;
      // סוג הטופס נקבע תמיד לפי סוג הפרופיל שנטען בפועל
      // (guide / coordinator) — גם כשהמנהל הראשי צופה במשתמש אחר,
      // כך שמוצגים כל הנתונים של אותו משתמש.
      this.profileType = profile.type;
      this.fillForm();
      // הצגת הקבצים הקיימים של המדריכה (קורות חיים ותעודות) —
      // כמו בדף האישור: שליפה מהשרת וקישורי פתיחה/הורדה.
      if (this.profileType === 'guide' && profile?.guide?.guideId) {
        this.loadExistingFiles(profile.guide.guideId);
      }
      // כשנפתח הצגה מהמנהל (readOnly) — כל השדות לא ניתנים לעריכה.
      if (this.readOnly) {
        this.disableCurrentForm();
      }
    });
  }

  /** שולף את קבצי ההעלאה הקיימים של המדריכה ומציג אותם כקישורים לפתיחה/הורדה. */
  private loadExistingFiles(guideId: number) {
    this.srv_guide.getGuideFiles(guideId).subscribe({
      next: (fileObjs: any[]) => {
        this.existingFiles = (fileObjs ?? [])
          .map((raw: any) => {
            const f: any = raw;
            const id = Number(f.FileId ?? f.fileId);
            if (!id) return null; // בלי מזהה — אי אפשר לבנות קישור
            return {
              fileName: f.FileName ?? f.fileName ?? '',
              kind: ((f.Kind ?? f.kind ?? '') === 'Cv' ? 'Cv' : 'Certificate') as
                | 'Cv'
                | 'Certificate',
              url: this.srv_guide.getFileUrl(id),
            };
          })
          .filter(
            (x: any): x is { fileName: string; kind: 'Cv' | 'Certificate'; url: string } =>
              x !== null,
          );
      },
      error: () => {}, // אין קבצים או שגיאה — משאירים את הרשימה ריקה
    });
  }

  /**
   * משבית את כל שדות הטופס הנוכחי (קלטים, רשימות, תיבות סימון)
   * כך שלא ניתן יהיה לשנות דבר בזמן צפייה במנהל הראשי.
   */
  private disableCurrentForm() {
    switch (this.profileType) {
      case 'guide':
        this.formGuide.disable();
        break;
      case 'coordinator':
        this.formCoordinator.disable();
        break;
      default:
        this.formUser.disable();
        break;
    }
  }

  /** ממלא את הטופס לפי הסוג בנתוני הפרופיל. */
  fillForm() {
    if (this.profileType === 'guide') {
      const u = this.profile.user;
      const g = this.profile.guide;
      this.formGuide.patchValue({
        FirstName: u.firstName,
        LastName: u.lastName,
        IdNumber: u.idNumber,
        PhoneNumber: u.phoneNumber || '',
        Email: u.email,
        CityId: u.city || '',
        ReligiousId: g.religiousId ? String(g.religiousId) : '',
        selectedAreasOfExpertises: g.regionId ?? [],
      });
      // שומרים את רשימת התחומים המקורית (כפי שנטענה מהשרת) —
      // כדי שבשמירה נדע אם המשתמש שינה בפועל את התחומים.
      this.regionBegin = g.regionId ?? [];

    } else if (this.profileType === 'coordinator') {
      const u = this.profile.user;
      const c = this.profile.coordinator;
      const s = c.school;
      this.formCoordinator.patchValue({
        FirstName: u.firstName,
        LastName: u.lastName,
        IdNumber: u.idNumber,
        PhoneNumber: u.phoneNumber || '',
        Email: u.email,
        RoleId: c.roleId ? String(c.roleId) : '',
        SchoolName: s?.schoolName || '',
        IsBoys: s ? String(s.isBoys ? 1 : 0) : '',
        CityId: s?.city || u.city || '',
        PrincipalName: s?.principalName || '',
        PhoneSecretary: s?.phoneSecretary || '',
        TypeSchoolId: s?.typeSchoolId ? String(s.typeSchoolId) : '',
        AgeSchoolId: s?.ageSchoolId ? String(s.ageSchoolId) : '',
      });
    } else if (this.profileType === 'admin') {
      const u = this.profile.user;
      this.formUser.patchValue({
        FirstName: u.firstName,
        LastName: u.lastName,
        IdNumber: u.idNumber,
        PhoneNumber: u.phoneNumber || '',
        Email: u.email,
      });
    }
  }

  // ── אירועי טופס משותפים ──
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
    this.filteredSchools = this.schools.filter((school: any) =>
      school.SchoolName.toLowerCase().includes(schoolToFilter),
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
  }

  isChecked(num: number): boolean {
    const selected = this.formGuide.get('selectedAreasOfExpertises')?.value ?? [];
    return selected.includes(num);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.CertificatesFiles = files;
    }
  }

  onOneFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.resumeFiles = input.files[0];
    }
  }

  // ── שליחה ושמירה ──
  onSubmit() {
    if (this.saving) return;
    if (this.readOnly) return; // מצב צפייה בלבד — לא מאפשרים שמירה.

    if (this.profileType === 'guide') {
      console.log("this.formGuide.value.selectedAreasOfExpertises:  ", this.formGuide.value.selectedAreasOfExpertises);
        console.log("this.regionBegin:  ", this.regionBegin);
      // if(this.formGuide.value.selectedAreasOfExpertises ==this.regionBegin)
      if (this.formGuide.invalid) {
        
        this.formGuide.markAllAsTouched();
        return;
      }
      this.saveGuide();
    } else if (this.profileType === 'coordinator') {
      if (this.formCoordinator.invalid) {
        this.formCoordinator.markAllAsTouched();
        return;
      }
      this.saveCoordinator();
    } else if (this.profileType === 'admin') {
      if (this.formUser.invalid) {
        this.formUser.markAllAsTouched();
        return;
      }
      this.saveUser();
    }
  }

  private saveUser() {
    this.saving = true;
    const v = this.formUser.getRawValue(); // כולל שדות disabled (ת.ז. וסיסמה)

    const payload = {
      FirstName: v.FirstName || '',
      LastName: v.LastName || '',
      Email: v.Email || '',
      PhoneNumber: v.PhoneNumber || '',
    };

    this.srv_user.updateUser(this.userId!, payload).subscribe((res) => {
      this.saving = false;
      if (!res) {
        this.error = 'אירעה שגיאה בשמירת הפרטים. נא לנסות שוב.';
        return;
      }
      this.dialogRef.close(true);
    });
  }

  private saveGuide() {
    this.saving = true;
    const v = this.formGuide.getRawValue(); // חשוב: כולל שדות disabled (ת.ז. וסיסמה)
    const selectedCity = v.CityId || this.profile.user.city;
    const regionIds = (v.selectedAreasOfExpertises as number[]) || [];

    const payload = {
      FirstName: v.FirstName || '',
      LastName: v.LastName || '',
      IdNumber: v.IdNumber || this.profile.user.idNumber || '',
      City: selectedCity,
      PhoneNumber: v.PhoneNumber || '',
      Email: v.Email || '',
      UserPassword: v.UserPassword || this.profile.user.userPassword || '',
      ReligiousId: Number(v.ReligiousId) || 0,
      RegionIds: regionIds,
      ResumeFile: this.resumeFiles,
      CertificateFiles: this.CertificatesFiles,
    };

    this.srv_guide.addGuide(payload).subscribe((res) => {
      this.saving = false;
      if (!res) {
        this.error = 'אירעה שגיאה בשמירת הפרטים. נא לנסות שוב.';
        return;
      }
      // השוואת תוכן בין התחומים שנבחרו עכשיו לבין אלו שהיו במקור (אחרי מיון)
      // — נכנס ל-if רק אם המשתמש באמת הוסיף או הסיר תחום התמחות.
      const selected = [...((v.selectedAreasOfExpertises as number[]) ?? [])]
        .sort((a, b) => a - b)
        .join(',');
      const original = [...this.regionBegin]
        .sort((a, b) => a - b)
        .join(',');

      if (selected !== original) {
        // התחומים השתנו — מבטלים את אישורה של המדריכה (isApproved → false).
        this.srv_guide
          .disapproveGuide(this.profile.guide.guideId)
          .subscribe(() => this.dialogRef.close(true));
      } else {
        this.dialogRef.close(true);
      }
    });
  }

  private saveCoordinator() {
    this.saving = true;
    const v = this.formCoordinator.getRawValue();
    const coord = this.profile.coordinator;
    const schoolCity = v.CityId || this.profile.user.city || '';

    const payload = {
      userId: Number(this.userId),
      firstName: v.FirstName || '',
      lastName: v.LastName || '',
      city: schoolCity,
      phoneNumber: v.PhoneNumber || '',
      email: v.Email || '',
      roleId: Number(v.RoleId) || 0,
      schoolId: coord?.schoolId || null,
      schoolName: v.SchoolName || '',
      isBoys: v.IsBoys === '1',
      schoolCity: schoolCity,
      principalName: v.PrincipalName || '',
      phoneSecretary: v.PhoneSecretary || '',
      typeSchoolId: Number(v.TypeSchoolId) || 0,
      ageSchoolId: Number(v.AgeSchoolId) || 0,
    };

    this.srv_user.updateCoordinator(payload).subscribe((res) => {
      this.saving = false;
      if (!res) {
        this.error = 'אירעה שגיאה בשמירת הפרטים. נא לנסות שוב.';
        return;
      }
      this.dialogRef.close(true);
    });
  }

  onClose() {
    this.dialogRef.close();
  }
}
