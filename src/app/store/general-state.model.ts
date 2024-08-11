export interface GeneralState {
    status: StateStatus
}

export type StateStatus = 'normal' | 'processing' | 'complete' | 'error'