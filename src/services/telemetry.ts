import { RealApiClient } from './realApiClient';

export type TelemetryEventName =
  | 'signup_completed'
  | 'profile_published'
  | 'portfolio_published'
  | 'architect_found'
  | 'briefing_saved'
  | 'contact_sent'
  | 'contact_received'
  | 'web_vital'
  | 'client_error';

export function trackEvent(eventName: TelemetryEventName, metadata?: Record<string, any>) {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  void RealApiClient.sendTelemetry(eventName, currentPath, metadata);
}

let monitoringInitialized = false;

export function initPerformanceAndErrorMonitoring() {
  if (monitoringInitialized || typeof window === 'undefined') return;
  monitoringInitialized = true;

  // Global client error monitoring
  window.addEventListener('error', (event) => {
    trackEvent('client_error', {
      message: String(event.message || 'Unknown error').slice(0, 200),
      source: String(event.filename || '').slice(0, 120),
      line: event.lineno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    trackEvent('client_error', {
      type: 'unhandledrejection',
      reason: String((event.reason && event.reason.message) || event.reason || 'Promise rejected').slice(0, 200),
    });
  });

  // Core Web Vitals (LCP, CLS, INP) via browser PerformanceObserver
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) {
          trackEvent('web_vital', { metric: 'LCP', value: Math.round(last.startTime) });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}

    try {
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) clsScore += entry.value || 0;
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      window.addEventListener(
        'pagehide',
        () => {
          if (clsScore > 0) {
            trackEvent('web_vital', { metric: 'CLS', value: Number(clsScore.toFixed(4)) });
          }
        },
        { once: true }
      );
    } catch {}

    try {
      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (entry.duration > 100) {
            trackEvent('web_vital', { metric: 'INP', value: Math.round(entry.duration) });
          }
        }
      });
      inpObserver.observe({ type: 'event', buffered: true } as any);
    } catch {}
  }
}
