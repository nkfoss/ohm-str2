export interface GeneralState {
    status: StateStatus
}

export type StateStatus = 'unsaved' | 'loading' | 'loaded' | 'error'