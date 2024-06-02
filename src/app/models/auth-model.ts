export interface AuthSignUpResponse {
    kind: string;
    idToken: string;
    refreshToken: string;
    email: string;
    expiresIn: number;
    localId: string;
}