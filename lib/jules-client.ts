import 'server-only'
import { headers } from 'next/headers'

// Types based on Jules API Alpha Documentation
export interface JulesSource {
  name: string
  id: string
  githubRepo?: {
    owner: string
    repo: string
  }
}

export interface JulesSession {
  name: string
  id: string
  title: string
  sourceContext: {
    source: string
    githubRepoContext?: {
      startingBranch: string
    }
  }
  prompt: string
  outputs?: Array<{
    pullRequest?: {
      url: string
      title: string
      description: string
    }
  }>
}

export interface JulesActivity {
  name: string
  type: string
  text?: string // Agent response text often here
  // Add other activity fields as discovered in Alpha
}

export class JulesClient {
  private apiKey: string
  private baseUrl = 'https://jules.googleapis.com/v1alpha'
  private source: string

  constructor(apiKey?: string, source?: string) {
    // Defense-First: Fail fast if no API key in env or passed
    this.apiKey = apiKey || process.env.JULES_API_KEY || ''
    if (!this.apiKey) {
        console.warn('⚠️ JulesClient initialized without JULES_API_KEY. Calls will fail.')
    }
    
    // Default source if not provided
    this.source = source || 'sources/github/surajsatyarthi/c-suite-magazine'
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Missing JULES_API_KEY')
    }

    const url = `${this.baseUrl}/${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
        ...options.headers,
      },
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Jules API Error (${response.status}): ${errorText}`)
    }

    return response.json()
  }

  /**
   * List available sources to find the correct ID
   */
  async listSources(): Promise<{ sources: JulesSource[], nextPageToken?: string }> {
    return this.fetch('sources')
  }

  /**
   * Create a new chat session with Jules
   */
  async createSession(prompt: string, title: string = 'Automated Audit'): Promise<JulesSession> {
    return this.fetch('sessions', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        sourceContext: {
          source: this.source,
          githubRepoContext: {
            startingBranch: 'main' // Always audit main for now
          }
        },
        automationMode: 'AUTO_CREATE_PR', // Enable agent actions
        title
      })
    })
  }

  /**
   * Send a follow-up message to an existing session
   */
  async sendMessage(sessionId: string, prompt: string): Promise<{}> {
    // Response is empty, agent replies in activities
    return this.fetch(`sessions/${sessionId}:sendMessage`, {
      method: 'POST',
      body: JSON.stringify({ prompt })
    })
  }

  /**
   * List activities (messages, plan updates) for a session
   */
  async listActivities(sessionId: string): Promise<{ activities: JulesActivity[] }> {
    return this.fetch(`sessions/${sessionId}/activities?pageSize=50`)
  }

  /**
   * Utility: Poll for the agent's reply
   */
  async waitForReply(sessionId: string, lastActivityCount: number = 0, timeoutMs = 60000): Promise<JulesActivity[]> {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
        const { activities } = await this.listActivities(sessionId)
        if (activities && activities.length > lastActivityCount) {
             // Basic heuristic: return new activities
             return activities.slice(lastActivityCount)
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
    }
    throw new Error('Timeout waiting for Jules reply')
  }
}
