/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Endpoint opcional al que enviar el formulario de contacto por POST. */
  readonly VITE_CONTACT_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
