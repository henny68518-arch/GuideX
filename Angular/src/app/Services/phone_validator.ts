import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class PhoneValidatorService {

  phoneValidator = (control: AbstractControl): ValidationErrors | null => {
    const isValid = this.validateInput(control.value);
    return isValid ? null : { invalidPhone: true };
  };

  validateInput(input: string): boolean {
    const regex = /^05[0-9]\d{7}$/;
    return regex.test(input);
  }
}
