import type { GalleryImage } from '@/components/experience/ProjectGallery';
import type { Locale } from '@/content';

// Curated presentation only: releases and metrics remain upstream facts.
const assets = [
  {
    "url": "/projects/mac-native/gallery/01-cherry-grove-hero.jpg",
    "width": 1920,
    "height": 800,
    "srcSet": "/projects/mac-native/gallery/01-cherry-grove-hero-768.webp 768w, /projects/mac-native/gallery/01-cherry-grove-hero-1280.webp 1280w, /projects/mac-native/gallery/01-cherry-grove-hero.jpg 1920w"
  },
  {
    "url": "/projects/mac-native/gallery/02-lake-landscape.png",
    "width": 1920,
    "height": 1200,
    "srcSet": "/projects/mac-native/gallery/02-lake-landscape-768.webp 768w, /projects/mac-native/gallery/02-lake-landscape-1280.webp 1280w, /projects/mac-native/gallery/02-lake-landscape.png 1920w"
  },
  {
    "url": "/projects/mac-native/gallery/03-multiplayer-combat.png",
    "width": 1920,
    "height": 1200,
    "srcSet": "/projects/mac-native/gallery/03-multiplayer-combat-768.webp 768w, /projects/mac-native/gallery/03-multiplayer-combat-1280.webp 1280w, /projects/mac-native/gallery/03-multiplayer-combat.png 1920w"
  },
  {
    "url": "/projects/mac-native/gallery/04-pillager-outpost.png",
    "width": 1920,
    "height": 1200,
    "srcSet": "/projects/mac-native/gallery/04-pillager-outpost-768.webp 768w, /projects/mac-native/gallery/04-pillager-outpost-1280.webp 1280w, /projects/mac-native/gallery/04-pillager-outpost.png 1920w"
  },
  {
    "url": "/projects/mac-native/gallery/05-nether.png",
    "width": 1920,
    "height": 1200,
    "srcSet": "/projects/mac-native/gallery/05-nether-768.webp 768w, /projects/mac-native/gallery/05-nether-1280.webp 1280w, /projects/mac-native/gallery/05-nether.png 1920w"
  },
  {
    "url": "/projects/mac-native/gallery/06-cherry-grove-multiplayer.png",
    "width": 1920,
    "height": 800,
    "srcSet": "/projects/mac-native/gallery/06-cherry-grove-multiplayer-768.webp 768w, /projects/mac-native/gallery/06-cherry-grove-multiplayer-1280.webp 1280w, /projects/mac-native/gallery/06-cherry-grove-multiplayer.png 1920w"
  }
];
const descriptions: Record<Locale, string[]> = {
  "en": [
    "Sunlit cherry grove overlooking grassy hills",
    "Lake beneath a cherry-covered hillside",
    "Multiplayer gameplay on open rocky terrain",
    "Pillager outpost with players and a crossbow",
    "Nether lava landscape with a zombified piglin",
    "Multiplayer scene in a cherry grove"
  ],
  "pt-PT": [
    "Cerejeiras ao sol com vista para colinas verdejantes",
    "Lago junto a uma colina coberta de cerejeiras",
    "Multijogador num terreno rochoso aberto",
    "Posto de saqueadores com jogadores e uma besta",
    "Paisagem de lava no Nether com um piglin zombificado",
    "Cena multijogador num bosque de cerejeiras"
  ],
  "pt-BR": [
    "Cerejeiras ao sol com vista para colinas verdes",
    "Lago junto a uma colina coberta de cerejeiras",
    "Multijogador em terreno rochoso aberto",
    "Posto de saqueadores com jogadores e uma besta",
    "Paisagem de lava no Nether com um piglin zumbificado",
    "Cena multijogador em um bosque de cerejeiras"
  ],
  "es": [
    "Cerezos al sol con vistas a colinas verdes",
    "Lago junto a una colina cubierta de cerezos",
    "Multijugador en un terreno rocoso abierto",
    "Puesto de saqueadores con jugadores y una ballesta",
    "Paisaje de lava del Nether con un piglin zombificado",
    "Escena multijugador en un bosque de cerezos"
  ]
};

export function curatedProjectGallery(slug: string, locale: Locale): GalleryImage[] {
  if (slug !== 'mac-native') return [];
  return assets.map((asset, index) => ({ ...asset, alt: descriptions[locale][index], caption: descriptions[locale][index] }));
}
