declare module '#app' {
  interface PageMeta {
    // The guidebook chapter a page belongs to: its nav tab and heading colour.
    chapter?: 'field' | 'relics' | 'catch' | 'teams' | 'breed'
  }
}

export {}
