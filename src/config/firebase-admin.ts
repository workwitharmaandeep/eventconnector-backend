import * as admin from "firebase-admin";

const hasFirebaseCreds =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (hasFirebaseCreds && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (err) {
    console.warn("Failed to initialize Firebase Admin with provided credentials:", err);
  }
} else if (!admin.apps.length) {
  console.warn("Firebase Admin credentials not configured in .env. Running in dev mock-auth mode.");
}

// Resilient wrapper for auth verification
export const firebaseAuth = {
  verifyIdToken: async (token: string) => {
    if (admin.apps.length) {
      return await admin.auth().verifyIdToken(token);
    }
    // Development fallback mock: decode or accept demo tokens
    if (token.startsWith("dev-mock-") || token.startsWith("mock-") || process.env.NODE_ENV !== "production") {
      try {
        // Try base64 payload if token is a standard JWT structure
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
          return {
            uid: payload.user_id || payload.sub || payload.uid || "dev-student-uid-1",
            email: payload.email || "student@example.com",
            name: payload.name || "Demo User",
            picture: payload.picture || null,
          };
        }
      } catch {
        // Fall through to default mock
      }

      if (token.includes("organizer")) {
        return {
          uid: "dev-organizer-uid-1",
          email: "organizer@college.edu",
          name: "Campus Tech Club",
          picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        };
      }

      return {
        uid: "dev-student-uid-1",
        email: "student@example.com",
        name: "Alex Dev",
        picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      };
    }

    throw new Error("Invalid or unverified token in production");
  },
};

export default admin;
