namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_BASE_URL?: string;

    NEXT_PUBLIC_FIREBASE_API_KEY?: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID?: string;
    NEXT_PUBLIC_FIREBASE_APP_ID?: string;
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?: string;

    GOOGLE_MAPS_EMBED_API_KEY?: string;

    PAYLOAD_SECRET?: string;
    PAYLOAD_ADMIN_EMAIL?: string;
    PAYLOAD_ADMIN_PASSWORD?: string;

    MONGO_INITDB_ROOT_USERNAME?: string;
    MONGO_INITDB_ROOT_PASSWORD?: string;
    DATABASE_HOST?: string;
    DATABASE_PORT?: string;
    DATABASE_NAME?: string;
    DATABASE_URI?: string;
  }
}
