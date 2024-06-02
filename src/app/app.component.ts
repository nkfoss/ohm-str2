import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatNativeDateModule } from '@angular/material/core';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { LoadingSpinnerService } from './components/loading-spinner/loading-spinner.service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { ExerciseService } from './services/exercise.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, NavbarComponent, MatNativeDateModule, LoadingSpinnerComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    
    readonly isLoading$ = this.spinnerService.isLoading();
    readonly loadingMessages$ = this.spinnerService.getMessages();

    constructor(private spinnerService: LoadingSpinnerService, private exerciseService: ExerciseService) {
        this.exerciseService.fetchExercises();
    }

}
