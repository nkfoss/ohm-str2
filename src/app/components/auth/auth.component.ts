import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { noEmptyStringValidator } from '../validators/empty-string.validator';
import { MatButtonModule } from '@angular/material/button';
import { JsonPipe } from '@angular/common';
import { AuthService, FirebaseAuthResponse } from '../../services/auth.service';
import { Observable, take } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-auth',
    standalone: true,
    imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, JsonPipe],
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.scss',
})
export class AuthComponent {

    constructor(private authService: AuthService, private router: Router) {}

    mode: 'Sign up' | 'Login' = 'Login';
    errorMsg: string = '';

    usernameFormControl = new FormControl<string>('', { nonNullable: true, validators: [noEmptyStringValidator(), Validators.email]})
    passwordFormControl = new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] })

    submit() {
        let authObs: Observable<FirebaseAuthResponse>;
        if (this.mode === 'Sign up') {
            authObs = this.authService.signUp(this.usernameFormControl.value, this.passwordFormControl.value);
        } else {
            authObs = this.authService.login(this.usernameFormControl.value, this.passwordFormControl.value);
        }
        authObs.pipe(take(1)).subscribe({
            next: (res) => this.router.navigate(['/home']),
            error: (err) => this.errorMsg = err.message,
        })
    }

    toggleMode() {
        if (this.mode === 'Sign up') {
            this.mode = 'Login';
        } else {
            this.mode = 'Sign up';
        }
    }
}
