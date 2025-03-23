export interface Event {
  id: number
  title: string
  location: {
    lat: number
    lng: number
  }
  category: string
  icon: string
  date: string
  time: string
  source: string
  sourceType: string
  sourceIcon: string
  excerpt: string
  content: string
  sourceUrl: string
  timestamp?: number // Optional timestamp in milliseconds
}

export interface Comment {
  id: number
  authorName: string
  authorImage: string
  content: string
  date: string
  likes: number
  isAI?: boolean
  timestamp?: number
}

export interface AnalysisReport {
  id: number
  title: string
  author: string
  position: string
  date: string
  category: string
  imageUrl: string
  likes: number
  comments: number
  readTime: number
  content?: string
  excerpt?: string
  commentsList?: Comment[]
  slug?: string
}

