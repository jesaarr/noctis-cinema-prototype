export type Profile = {
  id: string
  name: string
  avatar: string
}

export type MediaItem = {
  id: string
  title: string
  shortDescription: string
  longNote: string
  coverImage: string
  gallery: string[]
  director: string
  year: string
  match: string
  category: string
  videoUrl: string
  overlayMessage: string
}

export type Category = {
  id: string
  title: string
  items: MediaItem[]
}

export type AppData = {
  userName: string
  profiles: Profile[]
  categories: Category[]
}
