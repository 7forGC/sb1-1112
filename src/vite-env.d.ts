/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_OPENAI_MODEL: string
  readonly VITE_OPENAI_MAX_TOKENS: string
  readonly VITE_OPENAI_TEMPERATURE: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_MAX_UPLOAD_SIZE: string
  readonly VITE_SUPPORTED_IMAGE_TYPES: string
  readonly VITE_SUPPORTED_VIDEO_TYPES: string
  readonly VITE_SUPPORTED_AUDIO_TYPES: string
  readonly VITE_ENABLE_VIDEO_CALLS: string
  readonly VITE_ENABLE_AUDIO_CALLS: string
  readonly VITE_ENABLE_STORIES: string
  readonly VITE_ENABLE_GROUPS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}