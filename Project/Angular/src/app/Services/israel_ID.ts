import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class IdIsraelValidator {
    
    validateIsraeliID(id: string): boolean {
        // בדיקת אורך ותווים
        if (!/^\d{7,9}$/.test(id)) {
            return false;
        }

        // השלמה ל־9 ספרות
        id = id.padStart(9, '0');

        let sum = 0;

        for (let i = 0; i < 9; i++) {
            let digit = Number(id[i]);

            // כל ספרה שנייה מוכפלת ב־2
            if (i % 2 === 1) {
                digit *= 2;

                // אם יצא מספר דו־ספרתי מחברים ספרות
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
        }

        return sum % 10 === 0;
    }

    idValidator(): ValidatorFn {
        return (control: AbstractControl) => {
            const valid = this.validateIsraeliID(control.value);
            return valid ? null : { invalidID: true };
        };
    }
}