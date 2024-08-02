export class User {
    constructor(
        public email: string,
        public id: string,
        private _token: string,
        private _tokenExpirationMillis: number
    ) {}

    get token() {
        if (
            !this._tokenExpirationMillis ||
            new Date().getTime() > this._tokenExpirationMillis
        ) {
            return null;
        }
        return this._token;
    }
}
