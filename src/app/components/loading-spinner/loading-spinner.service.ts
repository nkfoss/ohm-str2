import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, pipe, map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LoadingSpinnerService {
    private readonly isLoadingSubject = new BehaviorSubject<boolean>(false);
    private readonly runningProcesses = new BehaviorSubject<{[key: string]: string}>({});

    constructor() {}

    addProcess(processName: string, message: string) {
        const processes = this.runningProcesses.getValue();
        processes[processName] = message;
        this.runningProcesses.next({...processes});
        this.isLoadingSubject.next(true);
    }

    completeProcess(processName: string) {
        const processes = this.runningProcesses.getValue();
        delete processes[processName];
        this.runningProcesses.next({...processes});
        if (Object.keys(processes).length < 1) {
            this.isLoadingSubject.next(false);
        }
    }

    isLoading(): Observable<boolean> {
        return this.isLoadingSubject;
    }

    getMessages(): Observable<string[]> {
        return this.runningProcesses.pipe(map(processes => Object.values(processes)))
    }
}
