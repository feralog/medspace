import { Topic } from '@/types'
import { StoredSubject } from '@/utils/storage'

class APIClient {
  private baseUrl: string
  private getAuthToken: () => Promise<string | null>

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (typeof window !== 'undefined' ? window.location.origin : '')
      : 'http://localhost:3001'

    // This will be set by the auth provider
    this.getAuthToken = async () => {
      // Will be implemented when we add auth
      if (typeof window !== 'undefined') {
        return localStorage.getItem('supabase_auth_token')
      }
      return null
    }
  }

  setAuthTokenGetter(getter: () => Promise<string | null>) {
    this.getAuthToken = getter
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAuthToken()

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || 'Request failed')
    }

    return response.json()
  }

  // Topics API
  async getTopics(): Promise<Topic[]> {
    return this.request('/topics')
  }

  async createTopic(topic: Omit<Topic, 'id' | 'createdAt' | 'scheduledReviews' | 'reviews' | 'completed'>) {
    return this.request('/topics', {
      method: 'POST',
      body: JSON.stringify(topic),
    })
  }

  async deleteTopic(id: string): Promise<void> {
    await this.request(`/topics/${id}`, {
      method: 'DELETE',
    })
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic> {
    return this.request(`/topics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  // Reviews API
  async completeReview(topicId: string, reviewNumber: number) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ topicId, reviewNumber }),
    })
  }

  // Subjects API
  async getSubjects(): Promise<StoredSubject[]> {
    return this.request('/subjects')
  }

  async createSubject(subject: string, color: string): Promise<StoredSubject> {
    return this.request('/subjects', {
      method: 'POST',
      body: JSON.stringify({ subject, color }),
    })
  }

  async updateSubject(oldSubject: string, newSubject: string, newColor: string): Promise<StoredSubject> {
    return this.request(`/subjects/${encodeURIComponent(oldSubject)}`, {
      method: 'PATCH',
      body: JSON.stringify({ newSubject, newColor }),
    })
  }

  async deleteSubject(subject: string): Promise<void> {
    await this.request(`/subjects/${encodeURIComponent(subject)}`, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new APIClient()