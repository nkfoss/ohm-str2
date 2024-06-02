import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoadingSpinnerService } from '../components/loading-spinner/loading-spinner.service';
import { Observable, catchError, finalize, of } from 'rxjs';
import { AuthSignUpResponse } from '../models/auth-model';

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    readonly AUTH_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp';
    readonly API_KEY = 'AIzaSyCjXILKK-sJUYw7bvVRlYyKEKl79RwfIJE';

    constructor(private http: HttpClient, private spinnerService: LoadingSpinnerService) {}

    signUp(email: string, password: string, returnSecureToken: boolean): Observable<AuthSignUpResponse> {
        const processName = 'AuthService.signUp';
        this.spinnerService.addProcess(processName, "Signing up...");
        const body = {
            email: email,
            password: password,
            returnSecureToken: returnSecureToken
        }
        const httpOptions = {
            params: new HttpParams().appendAll({
                key: this.API_KEY
            })
        }
        return this.http.post<AuthSignUpResponse>(this.AUTH_URL, body, httpOptions).pipe(
            finalize(() => this.spinnerService.completeProcess(processName))
        )
    }
}
