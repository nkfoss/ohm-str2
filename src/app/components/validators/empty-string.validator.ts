import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function noEmptyStringValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value ?? '';
        return !value.trim() ? {notEmpty: true} : null
    }
}