/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Endpoint opcional al que enviar el formulario de contacto por POST. */
  readonly VITE_CONTACT_ENDPOINT?: string
  /** ID de proyecto de Microsoft Clarity. Sin ella, Clarity no se carga. */
  readonly VITE_CLARITY_ID?: string
  /** DSN de Sentry. Sin ella, Sentry no se inicializa. */
  readonly VITE_SENTRY_DSN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
