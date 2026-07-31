import { 
  Tag, ShoppingCart, Coffee, Utensils, Car, Home,
  Heart, Bus, Plane, Book, GraduationCap,
  Music, Film, Smartphone, Gift, Briefcase
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  Tag, ShoppingCart, Coffee, Utensils, Car, Home,
  Heart, Bus, Plane, Book, GraduationCap,
  Music, Film, Smartphone, Gift, Briefcase
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
