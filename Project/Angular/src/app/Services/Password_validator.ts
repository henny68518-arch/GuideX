import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class PasswordvalidatorService {

  passwordValidator = (control: AbstractControl): ValidationErrors | null => {
    const isValid = this.validateInput(control.value);
    return isValid ? null : { invalidpassword: true };
  };

  validateInput(input: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_^+=-])[A-Za-z\d@$!%*?&.#_^+=-]{8,}$/;
    return regex.test(input);
  }
}