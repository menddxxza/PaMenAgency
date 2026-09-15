'use client';

import { useEffect, useState } from 'react';
import { guardarSuscripcionPush, borrarSuscripcionPush } from '@/app/(app)/notificaciones/actions';

/** El navegador da la clave pública VAPID en base64url; pushManager.subscribe()
 * la necesita como Uint8Array. Conversión estándar, no hay atajo en la Push API. */
function base64UrlAUint8Array(base64Url: string): Uint8Array {
  const relleno = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + relleno).replace(/-/g, '+').replace(/_/g, '/');
  const cadena = atob(base64);
  const salida = new Uint8Array(cadena.length);
  for (let i = 0; i < cadena.length; i++) salida[i] = cadena.charCodeAt(i);
  return salida;
}

type Estado = 'comprobando' | 'no-configurado' | 'no-soportado' | 'denegado' | 'inactivo' | 'activo';

/**
 * Notificaciones push de verdad (Web Push, el estándar del navegador — no
 * Expo Notifications ni ningún SDK de terceros). "Recordar" en una nota o
 * tarea (ver crearRecordatorioDeNota) ya guardaba una fecha; esto es lo que
 * hacía falta para que además avise de verdad en el dispositivo, entregado
 * por app/api/cron/recordatorios/route.ts una vez al día (límite del plan
 * Hobby de Vercel para los crons).
 */
export default function NotificacionesPush() {
  const [estado, setEstado] = useState<Estado>('comprobando');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function comprobar() {
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        setEstado('no-configurado');
        return;
      }
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setEstado('no-soportado');
        return;
      }
      if (Notification.permission === 'denied') {
        setEstado('denegado');
        return;
      }

      const registro = await navigator.serviceWorker.getRegistration();
      const suscripcion = await registro?.pushManager.getSubscription();
      setEstado(suscripcion ? 'activo' : 'inactivo');
    }
    comprobar();
  }, []);

  async function activar() {
    setCargando(true);
    setError(null);
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== 'granted') {
        setEstado('denegado');
        return;
      }

      const registro = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const clave = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!clave) throw new Error('Las notificaciones no están configuradas en este despliegue.');

      const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        // as BufferSource: el tipo de lib.dom para Uint8Array (ArrayBufferLike
        // genérico) no encaja del todo con lo que pide PushSubscriptionOptionsInit
        // desde TypeScript 5.7 — en tiempo de ejecución un Uint8Array normal es
        // justo lo que la Push API espera, el desajuste es solo de tipos.
        applicationServerKey: base64UrlAUint8Array(clave) as BufferSource,
      });

      const datos = suscripcion.toJSON();
      if (!datos.endpoint || !datos.keys?.p256dh || !datos.keys?.auth) {
        throw new Error('El navegador no ha devuelto una suscripción válida.');
      }

      const resultado = await guardarSuscripcionPush({
        endpoint: datos.endpoint,
        keys: { p256dh: datos.keys.p256dh, auth: datos.keys.auth },
      });
      if (!resultado.ok) throw new Error(resultado.error);

      setEstado('activo');
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se ha podido activar.');
    } finally {
      setCargando(false);
    }
  }

  async function desactivar() {
    setCargando(true);
    setError(null);
    try {
      const registro = await navigator.serviceWorker.getRegistration();
      const suscripcion = await registro?.pushManager.getSubscription();
      if (suscripcion) {
        await borrarSuscripcionPush(suscripcion.endpoint);
        await suscripcion.unsubscribe();
      }
      setEstado('inactivo');
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se ha podido desactivar.');
    } finally {
      setCargando(false);
    }
  }

  if (estado === 'comprobando' || estado === 'no-configurado') return null;

  if (estado === 'no-soportado') {
    return <p className="text-sm text-ink/55">Tu navegador no admite notificaciones push.</p>;
  }

  if (estado === 'denegado') {
    return (
      <p className="text-sm text-ink/55">
        Has bloqueado las notificaciones de Notiq en el navegador. Actívalas desde el candado
        junto a la dirección si quieres recibir recordatorios.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={estado === 'activo' ? desactivar : activar}
        disabled={cargando}
        className={estado === 'activo' ? 'btn-secondary' : 'btn-primary'}
      >
        {cargando
          ? 'Un momento…'
          : estado === 'activo'
            ? 'Desactivar notificaciones'
            : 'Activar notificaciones'}
      </button>
      <p className="mt-2 text-xs text-ink/45">
        {estado === 'activo'
          ? 'Recibirás un aviso en este dispositivo cuando toque un recordatorio (se revisan una vez al día).'
          : 'Actívalas para que "Recordar" en una nota o tarea avise de verdad en este dispositivo, no solo aparezca en Tareas.'}
      </p>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
