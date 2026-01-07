/**
 * ChittyID Integration Service
 * Handles OAuth flow and synchronization with ChittyID ecosystem
 */

interface ChittyIDUser {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  apps?: string[];
}

interface ChittyIDConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

class ChittyIDService {
  private config: ChittyIDConfig = {
    clientId: 'chittybeacon-app',
    redirectUri: `${window.location.origin}/auth/callback`,
    scopes: ['profile', 'apps:read', 'apps:sync']
  };

  private baseUrl = 'https://id.chittyos.com';
  
  /**
   * Check if user is connected to ChittyID
   */
  isConnected(): boolean {
    return !!localStorage.getItem('chittyid_token');
  }

  /**
   * Get stored user profile
   */
  getUser(): ChittyIDUser | null {
    const userData = localStorage.getItem('chittyid_user');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Get stored access token
   */
  getToken(): string | null {
    return localStorage.getItem('chittyid_token');
  }

  /**
   * Initiate OAuth flow
   */
  connect(): void {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state: this.generateState()
    });

    // Store state for verification
    localStorage.setItem('chittyid_state', params.get('state')!);
    
    // Redirect to ChittyID OAuth
    window.location.href = `${this.baseUrl}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string, state: string): Promise<boolean> {
    const storedState = localStorage.getItem('chittyid_state');
    
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('/api/auth/chittyid/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          redirect_uri: this.config.redirectUri
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Token exchange failed');
      }

      const { access_token, user } = await tokenResponse.json();

      // Store tokens and user data
      localStorage.setItem('chittyid_token', access_token);
      localStorage.setItem('chittyid_user', JSON.stringify(user));
      localStorage.removeItem('chittyid_state');

      return true;
    } catch (error) {
      console.error('ChittyID callback error:', error);
      return false;
    }
  }

  /**
   * Sync apps from ChittyID
   */
  async syncApps(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not connected to ChittyID');
    }

    try {
      const response = await fetch('/api/sync/chittyid/apps', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('App sync failed');
      }

      const result = await response.json();
      console.log(`Synced ${result.count} apps from ChittyID`);
    } catch (error) {
      console.error('ChittyID sync error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from ChittyID
   */
  disconnect(): void {
    localStorage.removeItem('chittyid_token');
    localStorage.removeItem('chittyid_user');
    localStorage.removeItem('chittyid_state');
  }

  /**
   * Generate secure random state
   */
  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Auto-discovery of connected apps
   */
  async discoverApps(): Promise<string[]> {
    const token = this.getToken();
    if (!token) return [];

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/user/apps`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) return [];

      const { apps } = await response.json();
      return apps.map((app: any) => app.id);
    } catch (error) {
      console.error('App discovery error:', error);
      return [];
    }
  }
}

export const chittyID = new ChittyIDService();
export type { ChittyIDUser };