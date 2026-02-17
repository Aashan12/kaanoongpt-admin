interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];

  track(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
    };
    this.events.push(event);
    this.sendToServer(event);
  }

  private async sendToServer(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  getEvents() {
    return [...this.events];
  }

  clear() {
    this.events = [];
  }
}

export const analyticsService = new AnalyticsService();