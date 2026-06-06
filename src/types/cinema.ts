export interface Movie {
  id: string;
  title: string;
  description: string;
  director: string;
  director_id: string;
  youtube_id: string;
  cover_url: string;
  created_at: string;
  // Yeni eklenen lüks stüdyo parametreleri:
  prompt_lore?: string;
  ai_tools?: string[];
  views_count?: number;
  resonance_count?: number;
}

export interface StoreItem {
  id: string;
  title: string;
  category: 'LUTS' | 'PROMPTS' | 'AUDIO' | '3D ASSETS';
  price: number;
  description: string;
  creator: string;
  rating: number;
  features: string[];
}