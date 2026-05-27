import { useEffect, useMemo, useRef, useState } from 'react'
import { mockAppData } from './data/mockData'
import type { Category, MediaItem, Profile } from './types'

function App() {
  const [screen, setScreen] = useState<'auth' | 'account' | 'home' | 'favorites'>('auth')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [playingItem, setPlayingItem] = useState<MediaItem | null>(null)
  const [navOpaque, setNavOpaque] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState(mockAppData.categories[0].id)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [watchedIds, setWatchedIds] = useState<string[]>([])
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem('aethra-session')
    if (saved) {
      const parsed = JSON.parse(saved) as { fullName: string }
      setFullName(parsed.fullName)
      setScreen('account')
    }

    const savedFavorites = window.localStorage.getItem('aethra-favorites')
    if (savedFavorites) {
      setFavoriteIds(new Set(JSON.parse(savedFavorites)))
    }

    const savedWatched = window.localStorage.getItem('aethra-watched')
    if (savedWatched) {
      setWatchedIds(JSON.parse(savedWatched))
    }

    const onScroll = () => setNavOpaque(window.scrollY > 16)
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const isMenuButton = target.closest('[data-menu-button]')
      const isMenuContent = target.closest('[data-menu-content]')

      if (!isMenuButton && !isMenuContent) {
        setCategoryMenuOpen(false)
      }
    }

    window.addEventListener('scroll', onScroll)
    window.addEventListener('click', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const heroItem = useMemo(() => mockAppData.categories[0].items[0], [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !playingItem) return

    const updateProgress = () => {
      if (video.duration) {
        setCurrentTime(video.currentTime)
        setDuration(video.duration)
        setProgress((video.currentTime / video.duration) * 100)
      }
    }

    video.currentTime = 0
    video.play().catch(() => {
      /* autoplay disabled by browser */
    })
    video.addEventListener('timeupdate', updateProgress)

    return () => {
      video.pause()
      video.removeEventListener('timeupdate', updateProgress)
    }
  }, [playingItem])

  const selectedCategory = useMemo<Category>(() => {
    return mockAppData.categories.find((category) => category.id === activeCategoryId) ?? mockAppData.categories[0]
  }, [activeCategoryId])

  const favorites = useMemo(() => {
    return mockAppData.categories
      .flatMap((category) => category.items)
      .filter((item) => favoriteIds.has(item.id))
  }, [favoriteIds])

  const watchedItems = useMemo(() => {
    return mockAppData.categories
      .flatMap((category) => category.items)
      .filter((item) => watchedIds.includes(item.id))
  }, [watchedIds])

  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favoriteIds)
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId)
    } else {
      newFavorites.add(itemId)
    }
    setFavoriteIds(newFavorites)
    window.localStorage.setItem('aethra-favorites', JSON.stringify(Array.from(newFavorites)))
  }

  const handleAuthSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = fullName.trim()
    if (!name || password.length < 4) {
      setErrorMessage('Lütfen geçerli bir ad soyad ve en az 4 karakterli şifre girin.')
      return
    }
    window.localStorage.setItem('aethra-session', JSON.stringify({ fullName: name }))
    setErrorMessage('')
    setScreen('account')
  }

  const handleAccountOpen = (profileIndex: number) => {
    setProfile(mockAppData.profiles[profileIndex])
    setScreen('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCardClick = (item: MediaItem) => {
    setSelectedItem(item)
  }

  const handlePlay = (item: MediaItem) => {
    setPlayingItem(item)
    setSelectedItem(null)
    if (!watchedIds.includes(item.id)) {
      const nextWatched = [item.id, ...watchedIds]
      setWatchedIds(nextWatched)
      window.localStorage.setItem('aethra-watched', JSON.stringify(nextWatched))
    }
  }

  const handleHeroPlay = () => {
    handlePlay(heroItem)
  }

  const closeModal = () => setSelectedItem(null)

  const closePlayer = () => {
    setPlayingItem(null)
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)
  }

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return
    const rect = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const newTime = (clickX / rect.width) * (video.duration || 0)
    video.currentTime = newTime
  }

  const handleSignOut = () => {
    setFullName('')
    setPassword('')
    setProfile(null)
    setScreen('auth')
    setAccountMenuOpen(false)
    setCategoryMenuOpen(false)
    window.localStorage.removeItem('aethra-session')
  }

  const activeName = profile?.name || fullName || mockAppData.userName
  const sessionName = fullName || mockAppData.userName

  const renderFilmGrid = (items: MediaItem[]) => (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-black/70 shadow-netflix transition hover:-translate-y-1 hover:border-netflix-red/30">
          <div className="relative h-72 overflow-hidden rounded-t-3xl">
            <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover transition duration-500" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              <p className="text-sm uppercase tracking-[0.25em] text-netflix-red">{item.year}</p>
              <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <p className="text-sm leading-6 text-neutral-300">{item.shortDescription}</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handlePlay(item)}
                className="rounded-2xl bg-netflix-red px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-red-700"
              >
                İzle
              </button>
              <button
                type="button"
                onClick={() => handleCardClick(item)}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Detay
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(item.id)}
                className={`rounded-2xl px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] transition ${favoriteIds.has(item.id) ? 'bg-netflix-red text-white' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
              >
                {favoriteIds.has(item.id) ? '♥ Favorim' : '♡ Ekle'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-netflix-background text-white">
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${navOpaque ? 'bg-black/95 border-b border-white/10 shadow-netflix' : 'bg-transparent'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                type="button"
                data-menu-button
                onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                aria-label="Kategori menüsünü aç"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {categoryMenuOpen && (
                <div data-menu-content className="fixed left-4 top-16 z-50 w-72 overflow-hidden rounded-3xl border border-white/10 bg-black/95 shadow-netflix backdrop-blur-xl">
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-netflix-red">Kategoriler</p>
                    <div className="mt-4 space-y-2">
                      {mockAppData.categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            setActiveCategoryId(category.id)
                            setCategoryMenuOpen(false)
                            setScreen('home')
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${category.id === activeCategoryId ? 'bg-netflix-red text-white' : 'bg-white/5 text-neutral-200 hover:bg-white/10'}`}
                        >
                          {category.title}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-white/10 p-4">
                    <button
                      type="button"
                      onClick={() => {
                        setScreen('home')
                        setCategoryMenuOpen(false)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${screen === 'home' ? 'bg-netflix-red text-white' : 'bg-white/5 text-neutral-200 hover:bg-white/10'}`}
                    >
                      Anasayfa
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScreen('favorites')
                        setCategoryMenuOpen(false)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${screen === 'favorites' ? 'bg-netflix-red text-white' : 'bg-white/5 text-neutral-200 hover:bg-white/10'}`}
                    >
                      Listem ({favorites.length})
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold tracking-[0.2em] text-white">Melek Su Borana</span>
              <span className="hidden text-xs uppercase tracking-[0.35em] text-neutral-400 sm:inline">Özel</span>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-neutral-300 md:flex">
            <button
              type="button"
              onClick={() => {
                setScreen('home')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="transition hover:text-white"
            >
              Anasayfa
            </button>
            <button
              type="button"
              onClick={() => {
                setScreen('home')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="transition hover:text-white"
            >
              İzle
            </button>
            <button
              type="button"
              onClick={() => {
                setScreen(screen === 'favorites' ? 'home' : 'favorites')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={`transition ${screen === 'favorites' ? 'text-netflix-red' : 'hover:text-white'}`}
            >
              Listem ({favorites.length})
            </button>
          </nav>
          <div className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAccountMenuOpen((value) => !value)}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-200 transition hover:bg-white/10"
            >
              <span>{activeName}</span>
              <span className="h-10 w-10 rounded-full bg-white/10" />
            </button>
            {accountMenuOpen && (
              <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-3xl border border-white/10 bg-black/95 p-5 shadow-netflix">
                <p className="text-xs uppercase tracking-[0.35em] text-netflix-red">Hesap</p>
                <p className="mt-3 text-sm font-semibold text-white">{activeName}</p>
                <p className="mt-2 text-xs text-neutral-400">{`${activeName.replace(/\s+/g, '').toLowerCase()}@proje.local`}</p>
                <div className="mt-4 space-y-3 border-t border-white/10 pt-4 text-sm text-neutral-300">
                  <button className="w-full rounded-2xl bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">Hesap Ayarları</button>
                  <button className="w-full rounded-2xl bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">Bildirim Tercihleri</button>
                  <button className="w-full rounded-2xl bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">Yardım & Destek</button>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-4 w-full rounded-2xl bg-netflix-red px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-red-700"
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {screen === 'account' && (
        <main className="account-select relative grid min-h-screen place-items-center overflow-hidden px-6 py-24 sm:px-12">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-netflix-red/20 to-transparent blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-tl from-blue-500/20 to-transparent blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-purple-500/20 via-netflix-red/20 to-pink-500/20 blur-3xl animate-pulse delay-500" />
          </div>
          <div className="relative z-10 w-full max-w-3xl">
            <div className="mb-12 text-center">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-4">Bir Hesap Seç</h1>
              <p className="text-neutral-300">Devam etmek için bir hesap seçiniz</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              {mockAppData.profiles.slice(0, 2).map((profile, index) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => index === 0 && handleAccountOpen(index)}
                  disabled={index !== 0}
                  className={`group relative overflow-hidden rounded-[2rem] transition-all duration-300 ${
                    index === 0
                      ? 'cursor-pointer hover:scale-105 active:scale-95'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-[2rem] border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-6 transition-all duration-300 hover:border-netflix-red/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-netflix-red/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex h-full flex-col items-center justify-center space-y-4">
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="h-24 w-24 rounded-full object-cover ring-2 ring-white/20 transition-all duration-300 group-hover:ring-netflix-red"
                      />
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                        {index === 0 && (
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-netflix-red font-semibold">Aktif</p>
                        )}
                        {index !== 0 && (
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-neutral-500 font-semibold">Yakında</p>
                        )}
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="absolute inset-0 rounded-[2rem] border-2 border-netflix-red/0 transition-all duration-300 group-hover:border-netflix-red/50 group-hover:shadow-[inset_0_0_20px_rgba(229,9,20,0.1)]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      )}

      {screen === 'auth' && (
        <main className="auth-gradient relative grid min-h-screen place-items-center overflow-hidden px-6 py-24 sm:px-12">
          <div className="pointer-events-none absolute inset-x-0 top-10 h-96 bg-[radial-gradient(circle_at_top,_rgba(229,9,20,0.08),_transparent_40%)]" />
          <div className="pointer-events-none absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-white/3 blur-3xl" />
          <div className="pointer-events-none absolute left-1/4 top-1/2 h-80 w-80 rounded-full bg-netflix-red/5 blur-3xl" />
          <div className="w-full max-w-2xl rounded-[3rem] border border-white/10 bg-black/90 p-10 shadow-netflix backdrop-blur-xl">
            <div className="mb-10 space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-netflix-red">Ben Sunarım </p>
              <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">Ad bulamadım  </h1>
              <p className="max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
               Evt Hoşgeldin güzeliiimmmmmm basit gelebilir belki tam 1 haftadır uğraşıyorum (övünmek gibi olabilir) herneyse iyi eglencelerrr
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-[1.5fr_1fr]">
                <div>
                  <label className="mb-3 block text-sm font-medium text-neutral-300">Ad Soyad</label>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Melek Su Boran oldugunu biliyorumda neyse"
                    className="w-full rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-netflix-red focus:ring-2 focus:ring-netflix-red/30"
                  />
                  <p className="mt-2 text-sm italic text-neutral-400">
                  
                  </p>
                </div>
                <div>
                  <label className="mb-3 block text-sm font-medium text-neutral-300">Şifre</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Şifreni gir bebis(salla)"
                    className="w-full rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-netflix-red focus:ring-2 focus:ring-netflix-red/30"
                  />
                </div>
              </div>

              {errorMessage ? <p className="text-sm text-netflix-red">{errorMessage}</p> : null}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-3xl bg-netflix-red px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-red-700"
              >
                Hesap Seçimine Geç (burası biraz saçma oldu ama olsun)
              </button>
            </form>
          </div>
        </main>
      )}

      {screen === 'account' && (
        <main className="min-h-screen px-6 py-28 text-center sm:px-10">
          <div className="mx-auto max-w-4xl rounded-[2.5rem] border border-white/10 bg-black/80 p-10 shadow-netflix backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.4em] text-netflix-red">Hesap Seçimi</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Hesabın emrine amade</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-neutral-300">
              burdan hesabını seçiyosun tmmı biraz gereksiz bir adım ama canım böyle yapmak istedi hadi girrr
            </p>
            <div className="mx-auto mt-12 max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-left shadow-netflix transition hover:-translate-y-1 hover:bg-white/10">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full border border-white/10 bg-white/10" />
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-neutral-400">Hesap</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{sessionName}</p>
                  <p className="text-sm text-neutral-400">{`${sessionName.replace(/\s+/g, '').toLowerCase()}@proje.local`}</p>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <p className="text-sm leading-7 text-neutral-300">
                  gir gir gir gir gir haaadiiii (heyecanlanmıs oalbiliirm)
                </p>
                <button
                  type="button"
                  onClick={handleAccountOpen}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-netflix-red px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-red-700"
                >
                  Hesabı Aç
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {screen === 'home' && (
        <main className="relative pt-24">
          <section className="relative overflow-hidden bg-black">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${heroItem.coverImage}')` }}
            />
            <div className="absolute inset-0 bg-netflix-background/90" />
            <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-black via-black/30 to-transparent" />
            <div className="relative mx-auto max-w-7xl px-6 py-28 sm:px-10 lg:py-32">
              <div className="max-w-3xl space-y-6">
                <span className="inline-flex rounded-full bg-netflix-red px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white">1. Sezon</span>
                <h1 className="text-6xl font-black uppercase tracking-[0.15em] text-white drop-shadow-[0_20px_60px_rgba(0,0,0,0.75)] sm:text-7xl">MELEK?</h1>
                <p className="max-w-xl text-base leading-8 text-neutral-200 sm:text-lg">
                  Hmmmm Buraya belki ikimizin filmini yazabiliriz ne dersin
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={handleHeroPlay}
                    className="inline-flex items-center rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-black transition hover:bg-neutral-200"
                  >
                    Oynat
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(heroItem)}
                    className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Daha Fazla Bilgi
                  </button>
                </div>
              </div>
            </div>
          </section>
          <section className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-netflix backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-netflix-red">Daha Önce İzlediklerin</p>
              <div className="mt-4 -mx-2 flex gap-4 overflow-x-auto py-2 px-2">
                {watchedItems.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-neutral-400">Henüz boş</div>
                ) : (
                  watchedItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="watched-poster group mr-3 inline-block overflow-hidden rounded-xl border border-white/10 bg-black/50 p-0 text-left transition hover:scale-105"
                    >
                      <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover" />
                      <div className="mt-2 w-40 px-1 text-sm text-white line-clamp-1 text-left">{item.title}</div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="mt-8 space-y-8">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-netflix backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-netflix-red">Seçili Kategori</p>
                    <h2 className="mt-2 text-3xl font-semibold text-white">{selectedCategory.title}</h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-neutral-200">Film sayısı: {selectedCategory.items.length}</span>
                </div>
              </div>

              {renderFilmGrid(selectedCategory.items)}
            </div>
          </section>
        </main>
      )}

      {screen === 'favorites' && (
        <main className="relative pt-24">
          <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
            <div className="space-y-8">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-netflix backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.35em] text-netflix-red">Özel Koleksiyon</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Listem</h2>
                <p className="mt-3 text-sm text-neutral-300">
                  {favorites.length === 0 ? 'favori eklemek icin kalbe tıkla bebis' : `${favorites.length} film favorin var.`}
                </p>
              </div>

              {favorites.length > 0 ? renderFilmGrid(favorites) : <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center shadow-netflix">
                <p className="text-lg text-neutral-400">Favori filmler buraya gelecek</p>
              </div>}
            </div>
          </section>
        </main>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 px-4 py-10 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl rounded-[2rem] border border-white/10 bg-black/95 p-6 shadow-netflix md:p-8">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-white transition hover:bg-white/10"
            >
              Kapat
            </button>
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
                  <img src={selectedItem.coverImage} alt={selectedItem.title} className="h-full w-full min-h-[320px] object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent p-6">
                    <p className="text-sm uppercase tracking-[0.25em] text-netflix-red">Eşleşme %{selectedItem.match}</p>
                    <h3 className="mt-2 text-3xl font-semibold text-white">{selectedItem.title}</h3>
                  </div>
                </div>
                <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">Künye</p>
                  <div className="grid gap-3 text-sm text-neutral-300 sm:grid-cols-2">
                    <div>
                      <span className="block font-semibold text-white">Yönetmen</span>
                      <span>{selectedItem.director}</span>
                    </div>
                    <div>
                      <span className="block font-semibold text-white">Yıl</span>
                      <span>{selectedItem.year}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h4 className="mb-4 text-xl font-semibold text-white">Özel Not</h4>
                  <p className="text-sm leading-7 text-neutral-300">{selectedItem.longNote}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h4 className="mb-4 text-xl font-semibold text-white">Burası Neden Var</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {selectedItem.gallery.map((image, index) => (
                      <div key={index} className="overflow-hidden rounded-3xl bg-black/40">
                        <img src={image} alt={`${selectedItem.title} galeri ${index + 1}`} className="h-40 w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedItem.id)}
                  className={`w-full rounded-3xl px-6 py-4 text-sm font-semibold uppercase tracking-[0.15em] transition ${favoriteIds.has(selectedItem.id) ? 'bg-netflix-red text-white' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
                >
                  {favoriteIds.has(selectedItem.id) ? '♥ Favorilerime Ekli' : '♡ Favorilerime Ekle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {playingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4 py-10">
          <div className="relative flex h-[80vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-black/95 p-6 shadow-netflix">
            <button
              type="button"
              onClick={closePlayer}
              className="absolute right-6 top-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-white transition hover:bg-white/10"
            >
              X
            </button>
            <div className="relative overflow-hidden rounded-[1.5rem] bg-black/80">
              <video
                ref={videoRef}
                className="h-[60vh] w-full bg-black object-cover"
                src={playingItem.videoUrl}
                poster={playingItem.coverImage}
                controls
              />
              {playingItem.overlayMessage && (
                <div className="message-overlay pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="max-w-3xl px-6 text-center text-2xl font-semibold text-white drop-shadow-lg">
                    {playingItem.overlayMessage}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between gap-4 text-sm text-neutral-300">
                <span>{playingItem.title}</span>
                <span>{`${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, '0')} / ${duration ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}` : '00:00'}`}</span>
              </div>
              <div
                onClick={handleProgressClick}
                className="relative h-3 cursor-pointer overflow-hidden rounded-full bg-white/10"
              >
                <div className="absolute inset-y-0 left-0 rounded-full bg-netflix-red" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 text-sm text-neutral-300">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-3 w-3 rounded-full bg-netflix-red" />
                  <span>Video oynatılıyor</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-neutral-300">Sana özel mesajlar</div>
              </div>
              <button
                type="button"
                onClick={closePlayer}
                className="w-full rounded-2xl bg-netflix-red px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-netflix-red/90"
              >
                Videoyu Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
