import { Component, Pipe, PipeTransform } from '@angular/core';
import { FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthForm } from '../../models/forms/auth-form.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../auth.service';
import { AuthSignUpResponse } from '../../models/auth-model';

@Pipe({
    name: 'authError',
    standalone: true
})
export class AuthErrorPipe implements PipeTransform{
    transform(errors: ValidationErrors) {
        if (errors['required']) {
            return 'Field is required'
        } else if (errors['email']) {
            return 'Valid email address is required'
        } else if (errors['minlength']) {
            return `Minimum length is ${errors['minlength'].requiredLength} characters`
        } else {
            return 'error'
        }
    }
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, AuthErrorPipe],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

    readonly authFormGroup = new FormGroup<AuthForm>(new AuthForm())
    readonly emailFormControl = this.authFormGroup.controls.email;
    readonly passwordFormControl = this.authFormGroup.controls.password

    errorMessage: string = '';

    constructor(private authService: AuthService) {}

    onLogin() {
        
    }

    onSignUp() {
        this.authService.signUp(
            this.emailFormControl.value ?? '', 
            this.passwordFormControl.value ?? '', 
            true
        ).subscribe({
            next: (authResponse: AuthSignUpResponse) => {
                console.log("I GOT IT")
            },
            error: (error) => this.errorMessage = error
        })
    }

}


