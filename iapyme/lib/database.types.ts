export type UserRole = 'buyer' | 'seller' | 'admin';

export type ProductStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'archived';

export type ProductType =
  | 'automation'
  | 'agent'
  | 'bot'
  | 'app'
  | 'web'
  | 'saas'
  | 'script'
  | 'template'
  | 'service';

export type PricingModel = 'one_time' | 'setup_plus_monthly' | 'monthly' | 'free';

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'discarded';

export type Profile = {
  id: string;
  role: UserRole;
  slug: string | null;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  is_verified: boolean;
  is_founder: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  slug: string;
  nombre: string;
  icono: string;
  descripcion: string;
  posicion: number;
  created_at: string;
};

export type Product = {
  id: string;
  seller_id: string;
  category_id: string;
  slug: string;
  titulo: string;
  tagline: string;
  problema: string;
  solucion: string;
  descripcion: string | null;
  requisitos: string | null;
  product_type: ProductType;
  pricing_model: PricingModel;
  precio_setup: number;
  precio_mensual: number;
  precio_unico: number;
  minutos_instalacion: number;
  idioma_producto: 'es' | 'en';
  tags: string[];
  cover_image_url: string | null;
  gallery_urls: string[];
  demo_video_url: string | null;
  status: ProductStatus;
  motivo_rechazo: string | null;
  is_featured: boolean;
  published_at: string | null;
  view_count: number;
  lead_count: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_id: string | null;
  nombre: string;
  email: string;
  telefono: string | null;
  empresa: string | null;
  mensaje: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
};

/** Producto con su categoría y su vendedor resueltos, tal como lo devuelven las consultas del catálogo. */
export type ProductoConRelaciones = Product & {
  categories: Pick<Category, 'slug' | 'nombre' | 'icono'> | null;
  profiles: Pick<Profile, 'slug' | 'display_name' | 'avatar_url' | 'is_verified'> | null;
};
