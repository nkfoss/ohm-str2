import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatNativeDateModule } from '@angular/material/core';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { LoadingSpinnerService } from './components/loading-spinner/loading-spinner.service';
import { ExerciseService } from './services/exercise.service';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, NavbarComponent, MatNativeDateModule, LoadingSpinnerComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    
    readonly isLoading$ = this.spinnerService.isLoading();
    readonly loadingMessages$ = this.spinnerService.getMessages();

    constructor(private spinnerService: LoadingSpinnerService, private exerciseService: ExerciseService, private authService: AuthService) {
        this.exerciseService.fetchExercises();
    }
    ngOnInit(): void {
        this.authService.autoLogin();
    }

}
