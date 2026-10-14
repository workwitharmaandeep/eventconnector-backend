import * as admin from "firebase-admin";
export declare const firebaseAuth: {
    verifyIdToken: (token: string) => Promise<import("firebase-admin/lib/auth/token-verifier").DecodedIdToken | {
        uid: any;
        email: any;
        name: any;
        picture: any;
    }>;
};
export default admin;
//# sourceMappingURL=firebase-admin.d.ts.map