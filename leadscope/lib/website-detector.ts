import type { WebsiteStatus } from '@/lib/types';

const SOCIAL_HOSTS = [
  'facebook.com',
  'instagram.com',
  'm.facebook.com',
  'fb.com',
  'wa.me',
  'api.whatsapp.com',
  'whatsapp.com',
];
const FETCH_TIMEOUT_MS = 6000;

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
}

export interface WebsiteCheckResult {
  status: WebsiteStatus;
  socialLinks: SocialLinks;
  finalUrl: string | null;
  email: string | null;
  html: string | null;
}

const MAILTO_RE = /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const GENERIC_EMAIL_DOMAINS = ['sentry.io', 'wixpress.com', 'example.com'];
const WHATSAPP_LINK_RE = /https?:\/\/(?:api\.)?(?:wa\.me|whatsapp\.com)\/[^\s"'<>)]+/i;

function extractEmail(html: string): string | null {
  const mailto = html.match(MAILTO_RE);
  if (mailto) return mailto[1] ?? null;

  const plain = html.match(EMAIL_RE);
  if (plain && !GENERIC_EMAIL_DOMAINS.some((d) => plain[0].includes(d))) {
    return plain[0];
  }
  return null;
}

/** Busca un enlace de WhatsApp (wa.me / api.whatsapp.com) en el HTML de la web. */
function extractWhatsapp(html: string): string | null {
  const match = html.match(WHATSAPP_LINK_RE);
  return match ? match[0] : null;
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function isSocialUrl(url: string): boolean {
  const host = hostnameOf(url);
  return !!host && SOCIAL_HOSTS.some((social) => host.includes(social));
}

function extractSocialLinks(url: string): SocialLinks {
  const host = hostnameOf(url);
  if (!host) return {};
  if (host.includes('facebook.com') || host.includes('fb.com')) return { facebook: url };
  if (host.includes('instagram.com')) return { instagram: url };
  if (host.includes('wa.me') || host.includes('whatsapp.com')) return { whatsapp: url };
  return {};
}

async function fetchWithTimeout(url: string, method: 'HEAD' | 'GET') {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'LeadScopeBot/1.0 (+https://leadscope.app)' },
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Determina si la web de un negocio existe, está caída, es solo una red
 * social, o está activa. No hace la detección de "web antigua": eso es
 * responsabilidad opcional de lib/ai-classifier.ts.
 */
export async function checkWebsite(website: string | null): Promise<WebsiteCheckResult> {
  if (!website) {
    return { status: 'no_website', socialLinks: {}, finalUrl: null, email: null, html: null };
  }

  if (isSocialUrl(website)) {
    return {
      status: 'social_only',
      socialLinks: extractSocialLinks(website),
      finalUrl: website,
      email: null,
      html: null,
    };
  }

  try {
    const res = await fetchWithTimeout(website, 'GET');

    if (isSocialUrl(res.url)) {
      return {
        status: 'social_only',
        socialLinks: extractSocialLinks(res.url),
        finalUrl: res.url,
        email: null,
        html: null,
      };
    }

    if (!res.ok) {
      return { status: 'broken', socialLinks: {}, finalUrl: res.url, email: null, html: null };
    }

    const html = (await res.text()).slice(0, 20000);
    const whatsapp = extractWhatsapp(html);
    return {
      status: 'active',
      socialLinks: whatsapp ? { whatsapp } : {},
      finalUrl: res.url,
      email: extractEmail(html),
      html,
    };
  } catch {
    return { status: 'broken', socialLinks: {}, finalUrl: website, email: null, html: null };
  }
}

export async function checkWebsitesBatch(
  websites: (string | null)[],
  concurrency = 8
): Promise<WebsiteCheckResult[]> {
  const results: WebsiteCheckResult[] = new Array(websites.length);
  let cursor = 0;

  async function worker() {
    while (cursor < websites.length) {
      const index = cursor++;
      results[index] = await checkWebsite(websites[index] ?? null);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, websites.length) }, worker));
  return results;
}
