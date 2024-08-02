import {
    HttpClient,
    HttpErrorResponse,
    HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { User } from '../components/auth/user.model';
import { Router } from '@angular/router';

export interface FirebaseAuthRequest {
    email: string;
    password: string;
    returnSecureToken: boolean;
}
export interface FirebaseAuthResponse {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
}
export interface FirebaseSigninResponse extends FirebaseAuthResponse {
    registered: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    user = new BehaviorSubject<User | undefined>(undefined);

    constructor(private http: HttpClient, private router: Router) {}

    private readonly key = 'AIzaSyBQKYaPkynOG5SUpwvZ4qFijLX9DKhxQSk';
    private readonly url = 'https://identitytoolkit.googleapis.com/v1/';
    private defaultOptions = {
        params: new HttpParams().set('key', this.key),
    };
    private tokenExpirationTimer: any;

    readonly USER_DATA = 'userData';

    signUp(email: string, password: string) {
        const req: FirebaseAuthRequest = {
            email: email,
            password: password,
            returnSecureToken: true,
        };
        return this.http
            .post<FirebaseAuthResponse>(
                this.url + 'accounts:signUp',
                req,
                this.defaultOptions
            )
            .pipe(
                tap((res: FirebaseAuthResponse) => this.handleAuth(res)),
                catchError((res: HttpErrorResponse) => this.handleError(res))
            );
    }

    login(email: string, password: string) {
        const req: FirebaseAuthRequest = {
            email: email,
            password: password,
            returnSecureToken: true,
        };
        return this.http
            .post<FirebaseSigninResponse>(
                this.url + 'accounts:signInWithPassword',
                req,
                this.defaultOptions
            )
            .pipe(
                tap((res: FirebaseAuthResponse) => this.handleAuth(res)),
                catchError((res: HttpErrorResponse) => this.handleError(res))
            );
    }

    autoLogin() {
        const userDataString = localStorage.getItem(this.USER_DATA);
        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString);
                const loadedUser = new User(
                    userData.email,
                    userData.id,
                    userData._token,
                    Number(userData._tokenExpirationMillis)
                );
                if (loadedUser.token) {
                    this.startLogoutTimer(
                        (userData._tokenExpirationMillis - Date.now())
                    );
                    this.user.next(loadedUser);
                }
            } catch (error) {
                return;
            }
        }
    }

    logout() {
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
            this.tokenExpirationTimer = null;
        }
        this.user.next(undefined);
        this.router.navigate(['/login']);
        localStorage.removeItem(this.USER_DATA);
    }

    startLogoutTimer(expirationMillis: number) {
        console.log("time", expirationMillis)
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationMillis);
    }

    private handleAuth(res: FirebaseAuthResponse) {
        const expirationMillis = Number(res.expiresIn) * 1000;
        const user = new User(
            res.email,
            res.localId,
            res.idToken,
            Date.now() + expirationMillis
        );
        localStorage.setItem(this.USER_DATA, JSON.stringify(user));
        this.user.next(user);
        this.startLogoutTimer(expirationMillis);
    }

    private handleError(res: HttpErrorResponse) {
        if (res.error.error.message === 'INVALID_LOGIN_CREDENTIALS') {
            return throwError(() => new Error('Incorrect email or password'));
        } else if (res.error.error.message === 'EMAIL_EXISTS') {
            return throwError(
                () => new Error('A user with this email already exists')
            );
        } else {
            return throwError(() => new Error('An unknown error occurred'));
        }
    }
}
