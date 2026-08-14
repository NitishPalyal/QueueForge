export type CONFIG = {
  readonly DATABASE_URL: string;
  readonly PORT: string;
  readonly JWT_SECRET: string;
  readonly REDIS_HOST: string;
  readonly REDIS_PORT: string;
  readonly GEMINI_API_KEY: string;
  readonly GROQ_API_KEY: string;
  readonly GOOGLE_USER: string;
  readonly GOOGLE_CLIENT_ID: string;
  readonly GOOGLE_CLIENT_SECRET: string;
  readonly GOOGLE_REFRESH_TOKEN: string;
  readonly B2_BUCKET_NAME: string;
  readonly B2_KEY_ID: string;
  readonly B2_APPLICATION_KEY: string;
  readonly B2_ENDPOINT: string;
};
