namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_BASE_URL?: string;

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
