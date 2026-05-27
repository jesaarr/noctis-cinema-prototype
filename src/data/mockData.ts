import type { AppData } from '../types'

const sampleVideo = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

export const mockAppData: AppData = {
  userName: 'Melek Su Boran',
  profiles: [
    {
      id: 'melek-profile',
      name: 'Melek',
      avatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'su-profile',
      name: '2. Profil',
      avatar:
        'https://images.uns40-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'boran-profile',
      name: 'Boran',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    },
  ],
  categories: [
    {
      id: 'favorites',
      title: 'Senin En Sevdiklerin neler',
      items: [
        {
          id: 'aethra-movie',
          title: '10 Ekim',
          shortDescription: 'Herşeyin Başladığı tarih',
          longNote:
            'Bu tarihin benim için belkide çoğu şeyin değiştiği ve hayatım boyu aklıma kazınacak mükemmel bir gün asıl içerik videoda',
          coverImage:
            'https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?auto=format&fit=crop&w=900&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
          ],
          director: 'Mert Kılıç ve Melek Su Boran',
          year: '10 Ekim 2025',
          match: '98',
          category: 'favorites',
          videoUrl: sampleVideo,
          overlayMessage: '10 Ekim\n\nHerşey burada başladı\nDünyam değişti',
        },
        {
          id: 'secret-laugh',
          title: '16 Aralık',
          shortDescription: 'Hayatımda ilk defa gece 4e kadar uyumadığım tek tarihti heyecandan sanırım',
          longNote:
            '...',
          coverImage:
            'https://hizliresim.com/qyz1rlx',
          gallery: [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
          ],
          director: 'Mert Kılıç',
          year: '2025',
          match: '96',
          category: 'favorites',
          videoUrl: sampleVideo,
          overlayMessage: 'Gece 4e kadar uyumadığımız\nSadece sen ve ben\nDünya durmuş gibiydi',
        },
      ],
    },
    {
      id: 'inside-jokes',
      title: 'Nostalji',
      items: [
        {
          id: 'laugh-track',
          title: 'Gece Yarısı Şakası',
          shortDescription: 'Sessiz bir kahkaha patlamasıyla dolu, sadece bize özel sahne.',
          longNote:
            'Hafif bir kırmızı şarap, kıvrılmalı bir bakış ve neden hatırlayınca hala gülümsediğim bir anı. Bu sahne seninle olduğunda daha da özel hale geliyor.',
          coverImage:
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
          ],
          director: 'Mert Kılıç',
          year: '2023',
          match: '94',
          category: 'inside-jokes',
          videoUrl: sampleVideo,
          overlayMessage: 'Hala gülümse\nO gülüşü unutamıyorum\nSeninle her anı özel',
        },
        {
          id: 'starlight-moment',
          title: 'Yıldızlı An',
          shortDescription: 'Sokak lambalarının altında geçen o unutulmaz akşam.',
          longNote:
            'Bu hikaye, birlikte yürüdüğümüz o sokakta başlıyor. İçimizdeki umutla dolu, küçük ama büyük bir an. Seninle her sahne bir film sahnesi gibi.',
          coverImage:
            'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=900&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
          ],
          director: 'Mert Kılıç',
          year: '2022',
          match: '90',
          category: 'inside-jokes',
          videoUrl: sampleVideo,
          overlayMessage: 'Sokak lambalarının altında\nSen ve benim hayalim\nO bakış hala kalbimde',
        },
      ],
    },
    {
      id: 'memories',
      title: 'Sinematik Anılar',
      items: [
        {
          id: 'first-glance',
          title: 'İlk Bakış',
          shortDescription: 'O anı yeniden yaşatan duygusal bir kısa film.',
          longNote:
            'İlk karşılaşma anımızdaki elektrik, hala kalbimde hissediliyor. Her sahne bir ilk bakışın sıcaklığını hatırlatıyor.',
          coverImage:
            'https://images.unsplash.com/photo-1510070009289-b5bc34383727?auto=format&fit=crop&w=900&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
          ],
          director: 'Mert Kılıç',
          year: '2026',
          match: '97',
          category: 'memories',
          videoUrl: sampleVideo,
          overlayMessage: 'İlk bakışında\nElektrik hissettim\nSeni hep istediğimi biliyordum',
        },
        {
          id: 'sunset-journey',
          title: 'Günbatımı Yolculuğu',
          shortDescription: 'Ufka doğru uzanan bir yolculuğun unutulmaz dokunuşu.',
          longNote:
            'O günbatımı, el ele verdiğimiz yolculuğun başlangıcını simgeliyor. Her sahne, birlikte yazdığımız bir not gibi.',
          coverImage:
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
          ],
          director: 'Mert Kılıç',
          year: '2024',
          match: '95',
          category: 'memories',
          videoUrl: sampleVideo,
          overlayMessage: 'El ele verdiğimiz anlarda\nDünya yok oldu\nSadece biz vardık',
        },
      ],
    },
    {
      id: 'night-session',
      title: 'Gece Seansları',
      items: [
        {
          id: 'moonlit-drive',
          title: 'Ay Işığı Yolculuğu',
          shortDescription: 'Geceyi aydınlatan bir yolculuk filmi.',
          longNote:
            'Bu açılış sahnesi, gece gökyüzünce çevrili bir yolculuğu hatırlatıyor. Her kare, gizemli ve büyüleyici.',
          coverImage:
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1510070009289-b5bc34383727?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
          ],
          director: 'Mert Kılıç',
          year: '2024',
          match: '92',
          category: 'night-session',
          videoUrl: sampleVideo,
          overlayMessage: 'Ay ışığında yolculuk\nSenin yanında heryer güzel\nGece bizi saklıyor',
        },
        {
          id: 'city-lights',
          title: 'Şehir Işıkları',
          shortDescription: 'Masalsı bir şehir akşamı size eşlik ediyor.',
          longNote:
            'Işıkların altındaki şehir, seninle paylaştığımız anılara daha da anlam kazandırıyor. Her sahne, unutulmaz bir anı saklıyor.',
          coverImage:
            'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=900&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
          ],
          director: 'Mert Kılıç',
          year: '2026',
          match: '91',
          category: 'night-session',
          videoUrl: sampleVideo,
          overlayMessage: 'Şehir ışıklarının altında\nSenin sesini duymak istedim\nSessizlik yeterdi',
        },
      ],
    },
    {
      id: 'silent-moments',
      title: 'Sessiz Anlar',
      items: [
        {
          id: 'soft-whisper',
          title: 'Yumuşak Fısıltı',
          shortDescription: 'Sahne sessiz, hisler yüksek.',
          longNote:
            'Bu hikaye, kelimelerin ötesindeki duyguları yakalıyor. Sessizlik bile seninle konuşuyor.',
          coverImage:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
          ],
          director: 'Mert Kılıç',
          year: '2026',
          match: '97',
          category: 'silent-moments',
          videoUrl: sampleVideo,
          overlayMessage: 'Kelimelere gerek yok\nSessizliğimiz konu açıyor\nKalbimiz konuşuyor',
        },
        {
          id: 'morning-glow',
          title: 'Sabah Parıltısı',
          shortDescription: 'Yeni bir günün ilk ışıklarıyla başlayan hikaye.',
          longNote:
            'Güneş doğarken birlikte olduğumuz anlar, özel bir filmden fırlamış gibi. Her çerçeve umut dolu.',
          coverImage:
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
          ],
          director: 'Mert Kılıç',
          year: '2026',
          match: '96',
          category: 'silent-moments',
          videoUrl: sampleVideo,
          overlayMessage: 'Güneş doğarken\nSenin gözlerinde benimle\nYeni bir gün başlıyor',
        },
      ],
    },
  ],
}
