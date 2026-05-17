export type ContactStatus = 'new' | 'contacted' | 'discarded'

export type Agency = {
  id: string
  name: string
  slug: string
}

export type Contact = {
  id: string
  agency_id: string
  name: string
  email: string
  message: string
  status: ContactStatus
  created_at: string
}

export type Profile = {
  user_id: string
  agency_id: string
}
