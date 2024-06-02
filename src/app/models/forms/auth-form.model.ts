import { FormControl, Validators } from "@angular/forms";

export class AuthForm {
    email = new FormControl<string>('', [Validators.required, Validators.email]);
    password = new FormControl<string>('', [Validators.required, Validators.minLength(6)] );
}