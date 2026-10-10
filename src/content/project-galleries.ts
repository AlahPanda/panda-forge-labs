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

type EditorialCaption = { title: string; sentence: string };
const captions: Record<Locale, EditorialCaption[]> = {
  "en": [
    {
      "title": "Take the scenic route",
      "sentence": "Leave room for a detour when the view is worth it."
    },
    {
      "title": "A little further",
      "sentence": "Pick a spot on the far bank and see where the journey takes you."
    },
    {
      "title": "Better together",
      "sentence": "Bring a friend and turn an ordinary outing into a story worth sharing."
    },
    {
      "title": "Plans can change",
      "sentence": "A quiet walk can become the adventure you remember most."
    },
    {
      "title": "Beyond the familiar",
      "sentence": "Step through the portal and find a different kind of adventure."
    },
    {
      "title": "Make yourself at home",
      "sentence": "Find your favourite corner of the world and enjoy it together."
    }
  ],
  "pt-PT": [
    {
      "title": "Vai pelo caminho mais bonito",
      "sentence": "Dá-te tempo para um desvio quando a vista merece."
    },
    {
      "title": "Só mais um pouco",
      "sentence": "Escolhe um lugar na outra margem e descobre onde te leva o caminho."
    },
    {
      "title": "Melhor com companhia",
      "sentence": "Leva um amigo e transforma um passeio numa história para contar."
    },
    {
      "title": "Os planos podem mudar",
      "sentence": "Uma caminhada tranquila pode tornar-se a aventura de que mais te lembras."
    },
    {
      "title": "Para lá do habitual",
      "sentence": "Atravessa o portal e descobre outra forma de aventura."
    },
    {
      "title": "Sente-te em casa",
      "sentence": "Encontra o teu recanto favorito e aproveita-o com quem joga contigo."
    }
  ],
  "pt-BR": [
    {
      "title": "Vá pelo caminho mais bonito",
      "sentence": "Reserve tempo para um desvio quando a vista vale a pena."
    },
    {
      "title": "Só mais um pouco",
      "sentence": "Escolha um lugar na outra margem e descubra aonde o caminho leva."
    },
    {
      "title": "Melhor com companhia",
      "sentence": "Chame um amigo e transforme um passeio em uma história para contar."
    },
    {
      "title": "Os planos podem mudar",
      "sentence": "Uma caminhada tranquila pode virar a aventura de que você mais se lembra."
    },
    {
      "title": "Além do conhecido",
      "sentence": "Atravesse o portal e descubra outro jeito de se aventurar."
    },
    {
      "title": "Sinta-se em casa",
      "sentence": "Encontre seu cantinho favorito e aproveite com quem joga com você."
    }
  ],
  "es": [
    {
      "title": "Elige el camino más bonito",
      "sentence": "Deja tiempo para un desvío cuando las vistas lo merezcan."
    },
    {
      "title": "Un poco más allá",
      "sentence": "Elige un lugar en la otra orilla y descubre adónde te lleva el camino."
    },
    {
      "title": "Mejor en compañía",
      "sentence": "Invita a un amigo y convierte un paseo en una historia que contar."
    },
    {
      "title": "Los planes pueden cambiar",
      "sentence": "Un paseo tranquilo puede convertirse en la aventura que más recuerdes."
    },
    {
      "title": "Más allá de lo conocido",
      "sentence": "Cruza el portal y descubre otra forma de aventura."
    },
    {
      "title": "Siéntete como en casa",
      "sentence": "Encuentra tu rincón favorito y disfrútalo con quienes juegan contigo."
    }
  ]
};

const labels: Record<Locale, { open: string; close: string; viewer: string; keyboard: string }> = {
  en: { open: 'Open image', close: 'Close image viewer', viewer: 'Image viewer', keyboard: 'Use the left and right arrow keys to browse. Press Escape to close.' },
  'pt-PT': { open: 'Ampliar imagem', close: 'Fechar visualizador', viewer: 'Visualizador de imagens', keyboard: 'Usa as setas esquerda e direita para navegar. Prime Escape para fechar.' },
  'pt-BR': { open: 'Ampliar imagem', close: 'Fechar visualizador', viewer: 'Visualizador de imagens', keyboard: 'Use as setas esquerda e direita para navegar. Pressione Escape para fechar.' },
  es: { open: 'Ampliar imagen', close: 'Cerrar visor', viewer: 'Visor de imágenes', keyboard: 'Usa las flechas izquierda y derecha para navegar. Pulsa Escape para cerrar.' },
};
export const galleryLabels = (locale: Locale) => labels[locale];
export function curatedProjectGallery(slug: string, locale: Locale): GalleryImage[] {
  if (slug !== 'mac-native') return [];
  return assets.map((asset, index) => ({
    ...asset, alt: descriptions[locale][index], captionTitle: captions[locale][index].title,
    caption: captions[locale][index].sentence,
    // Anchor tall gameplay views at the bottom to keep characters and the hotbar.
    // The river's upper sky/FPS strip is omitted in the panoramic card, never in the original.
    objectPosition: asset.height === 1200 ? '50% 100%' : '50% 50%',
  }));
}
