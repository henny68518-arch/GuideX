import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { Srv_Guide } from '../../../Services/srv-guide.service';
import { ServiceAllService } from '../../../Services/service-all.service';
import {
  Int_Guide,
  GuideFileDto,
  GuideFileWithUrl,
  GuideWithFiles,
} from './int-guide';

/**
 * דף ניהול — אישור מדריכות.
 * שני מקטעים:
 *  1. מדריכות הממתינות לאישור (ערך אישור = false) — עם כפתור "אשר מדריכה".
 *  2. מדריכות שכבר אושרו (ערך אישור = true) — עם תג "מאושרת" וכפתור "בטל אישור".
 * בשני המקטעים מוצגים אותם נתונים בדיוק, כולל קורות חיים ותעודות.
 * בלחיצה על הקובץ — הוא נפתח/מורד מהשרת (GET api/Guide/file/{id}).
 */
@Component({
  selector: 'app-admin-guide-permission',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './admin-guide-permission.component.html',
  styleUrl: './admin-guide-permission.component.scss',
})
export class AdminGuidePermissionComponent {
  /** המדריכות הממתינות לאישור + הקבצים שלהן. */
  data: GuideWithFiles[] = [];

  /** המדריכות שכבר אושרו + הקבצים שלהן (ניתן לבטל את האישור). */
  approvedData: GuideWithFiles[] = [];

  /** כל המדריכות הממתינות — לפי הסינון (מקור ללא מסנן החיפוש). */
  private allPending: GuideWithFiles[] = [];
  /** כל המדריכות המאושרות — לפי הסינון (מקור ללא מסנן החיפוש). */
  private allApproved: GuideWithFiles[] = [];

  /** טקסט החיפוש החופשי — מסנן לפי שם מלא. */
  searchTerm = '';

  /** האם המקטע של הממתינות סיים להיטען. */
  isLoading = true;
  /** האם המקטע של המאושרות סיים להיטען (נטען בנפרד מהממתינות). */
  isLoadingApproved = true;

  /** הודעה במקרה של שגיאה בטעינה. */
  errorMessage = '';

  /** הודעה במקרה של שגיאה בטעינת המאושרות. */
  errorMessageApproved = '';

  /** מזהה המדריכה שתהליך האישור שלה נמצא כעת בעיצומו (מונע לחיצות כפולות). */
  approvingGuideId: number | null = null;

  /** מזהה המדריכה שתהליך ביטול האישור שלה נמצא כעת בעיצומו. */
  disapprovingGuideId: number | null = null;

  /** כל אזורי התמחות — להצגת שמות האזורים. */
  private availableAreas: { id: number; name: string }[] = [];
  /** שמות העדות לפי religiousId (מוטענים עד דרישה). */
  private religiousNames = new Map<number, string>();

  /** מפתח תשובת השרת שאוגר את מטא-הקבצים (GuideResponseDto.Files). */
  private readonly filesKey = 'Files';

  constructor(
    public srv_guide: Srv_Guide,
    public srv_all: ServiceAllService,
  ) {
    this.loadAreas();
    this.loadData();
    this.loadApprovedData();
  }

  /** שולף את שמות אזורי ההתמחות מהשרת. */
  private loadAreas() {
    this.srv_all.getRegionsArray().subscribe({
      next: (areas: any[]) => {
        this.availableAreas = (areas ?? []).map((a) => ({
          id: Number(a.regionId),
          name: a.regionName ?? '',
        }));
      },
      error: (err: any) => console.error('שגיאה בשליפת אזורי התמחות:', err),
    });
  }

  /** טוען את המדריכות שטרם אושרו, וגורר את הקבצים של כל אחת מהן. */
  loadData() {
    this.isLoading = true;
    this.errorMessage = '';

    // false = רק מי שטרם אושרה (סינון בצד הלקוח).
    this.srv_guide.GetGuides(false).subscribe({
      next: (guides: any[]) => {
        const entries: GuideWithFiles[] = (guides ?? []).map((g) => ({
          guide: this.normalizeGuide(g),
          files: this.filesFromGuide(g),
        }));
        this.allPending = entries;
        this.applySearch();

        // בכל מקרה משיכת הקבצים גם בדרך נפרדת (getGuideFiles) — כך שהקבצים
        // יוצגו גם אם השרת לא מחזיר אותם בתוך תשובת המדריכות עצמה.
        entries.forEach((entry) => this.loadFilesForGuide(entry, entry.guide.guideId));

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('שגיאה בשליפת המדריכות הממתינות:', err);
        this.errorMessage = 'אירעה שגיאה בטעינת המדריכות. נא לנסות שוב.';
        this.isLoading = false;
      },
    });
  }

  /** טוען את המדריכות שכבר אושרו, וגורר את הקבצים של כל אחת מהן. */
  loadApprovedData() {
    this.isLoadingApproved = true;
    this.errorMessageApproved = '';

    // true = רק מי שאושרה (סינון בצד הלקוח).
    this.srv_guide.GetGuides(true).subscribe({
      next: (guides: any[]) => {
        const entries: GuideWithFiles[] = (guides ?? []).map((g) => ({
          guide: this.normalizeGuide(g),
          files: this.filesFromGuide(g),
        }));
        this.allApproved = entries;
        this.applySearch();

        entries.forEach((entry) => this.loadFilesForGuide(entry, entry.guide.guideId));

        this.isLoadingApproved = false;
      },
      error: (err: any) => {
        console.error('שגיאה בשליפת המדריכות המאושרות:', err);
        this.errorMessageApproved = 'אירעה שגיאה בטעינת המדריכות. נא לנסות שוב.';
        this.isLoadingApproved = false;
      },
    });
  }

  /**
   * מנרמל את תשובת השרת לשמות השדות שהתבנית מצפה להם (camelCase).
   * השרת (GuideResponseDto) מחזיר PascalCase — GuideId / IsApproved /
   * AreasOfExpertise — ולכן בלי הנרמול הכרטיסים היו מתרוקנים.
   * תומך בשני הפורמטים כדי לא להישבר מול שרת שמחזיר camelCase.
   */
  private normalizeGuide(raw: any): Int_Guide {
    const g: any = raw ?? {};
    // תחומי ההתמחות: אצל השרת הם AreasOfExpertise, ולפעמים regionId.
    const areas = g.AreasOfExpertise ?? g.areasOfExpertise ?? g.regionId ?? g.RegionId;
    return {
      guideId: Number(g.GuideId ?? g.guideId),
      userId: Number(g.UserId ?? g.userId),
      firstName: g.FirstName ?? g.firstName ?? '',
      lastName: g.LastName ?? g.lastName ?? '',
      idNumber: g.IdNumber ?? g.idNumber ?? '',
      city: g.City ?? g.city ?? null,
      phoneNumber: g.PhoneNumber ?? g.phoneNumber ?? null,
      email: g.Email ?? g.email ?? null,
      religiousId: Number(g.ReligiousId ?? g.religiousId),
      regionId: Array.isArray(areas) ? areas.map((a: any) => Number(a)) : [],
      isApproved: Boolean(g.IsApproved ?? g.isApproved),
    };
  }

  /** שולף את קבצי מדריכה אחת (Overview / Certificates) דרך ה-API הנפרד ומצרף לכרטיס. */
  private loadFilesForGuide(entry: GuideWithFiles, guideId: number) {
    this.srv_guide.getGuideFiles(guideId).subscribe({
      next: (fileObjs: any[]) => {
        const fetched: GuideFileWithUrl[] = (fileObjs ?? []).map((raw) => {
          const f: any = raw; // יכול לבוא ב-camelCase או PascalCase.
          return {
            fileName: f.FileName ?? f.fileName ?? '',
            kind: ((f.Kind ?? f.kind ?? '') === 'Cv' ? 'Cv' : 'Certificate') as
              | 'Cv'
              | 'Certificate',
            // השרת מחזיר את המזהה בשם FileId (לא GuideFileId) — תומכים בשתי הצורות.
            url: this.fileUrl(Number(f.GuideFileId ?? f.guideFileId ?? f.FileId ?? f.fileId)),
          };
        }).filter((f) => f.url !== '');

        // אם אין קבצים מהשדה בתשובה — נשתמש בקבצים שהגיעו מ-getGuideFiles.
        if (entry.files.length === 0) {
          entry.files = fetched;
        }
      },
      error: () => {},
    });
  }

  /**
   * מחלץ את מטא-הקבצים (GuideFileDto) מתוך תשובת המדריכה.
   * השרת (GuideResponseDto) מחזיר את הקבצים בשדה "Files" עבור כל מדריכה,
   * כך שאין צורך בקריאה נפרדת — הקישורים נבנים ישירות מהמטא הזה.
   */
  private filesFromGuide(g: any): { fileName: string; kind: 'Cv' | 'Certificate'; url: string }[] {
    // השרת עשוי להחזיר את שדה הקבצים כ-"Files" (PascalCase) או "files" (camelCase).
    const files: GuideFileDto[] = Array.isArray(g?.[this.filesKey])
      ? (g[this.filesKey] as GuideFileDto[])
      : Array.isArray(g?.['files']) // camelCase
        ? (g['files'] as GuideFileDto[])
        : [];
    return files.map((f2) => {
      const f: any = f2; // יכול לבוא ב-camelCase או PascalCase.
      return {
        // קבלת שדות הקובץ בשני הפורמטים (PascalCase / camelCase).
        fileName: f.FileName ?? f.fileName ?? '',
        kind: (f.Kind ?? f.kind ?? '') === 'Cv' ? 'Cv' : 'Certificate',
        // השרת מחזיר את המזהה בשם FileId (לא GuideFileId) — תומכים בשתי הצורות.
        url: this.fileUrl(Number(f.GuideFileId ?? f.guideFileId ?? f.FileId ?? f.fileId)),
      };
    });
  }

  /**
   * קישור לפתיחה/הורדה של קובץ — לפי ה-baseUrl של השירות
   * (כולל את תבנית הקובץ שאליה מתחבר השרת).
   */
  private fileUrl(guideFileId: number): string {
    if (Number.isNaN(guideFileId)) return '';
    return `${this.srv_guide.getFileUrl(guideFileId)}`;
  }

  /** שם מלא של מדריכה. */
  fullName(g: Int_Guide): string {
    return `${g.firstName ?? ''} ${g.lastName ?? ''}`.trim();
  }

  /**
   * מחיל את מסנן החיפוש על שתי רשימות הכרטיסים (הממתינות והמאושרות),
   * לפי השם המלא, מבלי לשנות את הרשימות המקוריות.
   */
  private applySearch() {
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      this.data = (this.allPending || []).filter((e) =>
        this.fullName(e.guide).toLowerCase().includes(term)
      );
      this.approvedData = (this.allApproved || []).filter((e) =>
        this.fullName(e.guide).toLowerCase().includes(term)
      );
    } else {
      this.data = this.allPending || [];
      this.approvedData = this.allApproved || [];
    }
  }

  /** מעדכן את תיבת החיפוש ומסנן מחדש את הכרטיסים. */
  onSearch(value: string) {
    this.searchTerm = value;
    this.applySearch();
  }

  /** שם אזור התמחות לפי regionId. */
  private getRegionName(id: number): string {
    const found = this.availableAreas.find((a) => a.id === id);
    return found ? found.name : '';
  }

  /** שמות אזורי ההתמחות של המדריכה (מופרדים בפסיק). */
  getRegionsNames(ids: number[] | null | undefined): string {
    return (ids ?? [])
      .map((id) => this.getRegionName(id))
      .filter((n) => n !== '')
      .join(', ');
  }

  /** שם העדה לפי religiousId — נטען מהשרת עד דרישה. */
  getReligiousName(religiousId: number): string {
    if (!this.religiousNames.has(religiousId)) {
      this.religiousNames.set(religiousId, 'בטעינה…');
      this.srv_all.getReligiousName(religiousId).subscribe((name) => {
        this.religiousNames.set(religiousId, name ?? 'אחר');
      });
    }
    return this.religiousNames.get(religiousId) ?? 'בטעינה…';
  }

  /** כל הקבצים של המדריכה. */
  allFiles(entry: GuideWithFiles) {
    return entry.files;
  }

  /**
   * מאשר מדריכה: משנה את ערך האישור בשרת (false→true).
   * עם הצלחה — המדריכה יורדת מרשימת הממתינות ועוברת לרשימת המאושרות.
   */
  approve(guideId: number) {
    if (this.approvingGuideId !== null) return; // כבר מתבצע אישור אחר
    this.approvingGuideId = guideId;

    this.srv_guide.approveGuide(guideId).subscribe({
      next: () => {
        this.approvingGuideId = null;
        // מציאת המדריכה לפני הסרתה — כדי להעביר אותה למקטע המאושרות.
        const entry = this.allPending.find((d) => d.guide.guideId === guideId);
        this.allPending = this.allPending.filter((d) => d.guide.guideId !== guideId);
        if (entry) {
          entry.guide.isApproved = true;
          this.allApproved = [entry, ...this.allApproved];
        }
        this.applySearch();
      },
      error: (err: any) => {
        this.approvingGuideId = null;
        console.error(`שגיאה באישור מדריכה ${guideId}:`, err);
        alert('אירעה שגיאה באישור המדריכה. נא לנסות שוב.');
      },
    });
  }

  /**
   * מבטל אישור של מדריכה: משנה את ערך האישור בשרת (true→false).
   * עם הצלחה — המדריכה יורדת מרשימת המאושרות ועוברת לרשימת הממתינות.
   */
  disapprove(guideId: number) {
    if (this.disapprovingGuideId !== null) return; // כבר מתבצע ביטול אחר
    this.disapprovingGuideId = guideId;

    this.srv_guide.disapproveGuide(guideId).subscribe({
      next: () => {
        this.disapprovingGuideId = null;
        const entry = this.allApproved.find((d) => d.guide.guideId === guideId);
        this.allApproved = this.allApproved.filter((d) => d.guide.guideId !== guideId);
        if (entry) {
          entry.guide.isApproved = false;
          this.allPending = [entry, ...this.allPending];
        }
        this.applySearch();
      },
      error: (err: any) => {
        this.disapprovingGuideId = null;
        console.error(`שגיאה בביטול אישור מדריכה ${guideId}:`, err);
        alert('אירעה שגיאה בביטול אישור המדריכה. נא לנסות שוב.');
      },
    });
  }
}
