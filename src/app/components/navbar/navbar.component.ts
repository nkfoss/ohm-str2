import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
    authenticated: boolean = false;
    destroyRef: Subject<void> = new Subject();

    constructor(private router: Router, private authService: AuthService) {}

    ngOnInit(): void {
        this.authService.user
            .pipe(takeUntil(this.destroyRef))
            .subscribe((user) => {
                this.authenticated = !!user;
            });
    }

    ngOnDestroy(): void {
        this.destroyRef.next();
    }

    navigateHome() {
        this.router.navigateByUrl('/home');
    }

    logout() {
        this.authService.logout();
    }
}
