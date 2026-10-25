/**
 * Gate attendance window policy for daily check-in.
 */
export type PresencePolicy = {
  gateOpen: string;
  onTimeUntil: string;
  lateToleranceMinutes: number;
  gateClose: string;
  dismissalWeekday: string;
  dismissalFriday: string;
  /** School identity fields carried by the same attendance settings document. */
  schoolName?: string;
  timezone?: string;
};

/**
 * Geofence radius and anti-spoofing policy for the school gate.
 */
export type GeofencePolicy = {
  radiusMeters: number;
  centerLat: number;
  centerLng: number;
  detectFakeGps: boolean;
  requireSelfieLiveness: boolean;
};

/**
 * WhatsApp gateway notification policy and message templates.
 */
export type NotificationPolicy = {
  autoSendOnCheckIn: boolean;
  checkInTemplate: string;
  sanctionTemplate: string;
  gatewayQuota: number;
};

/**
 * Aggregate of every editable operational policy on the settings page.
 */
export type SystemSettings = {
  presence: PresencePolicy;
  geofence: GeofencePolicy;
  notifications: NotificationPolicy;
};

/**
 * Settings tab identifiers.
 */
export type SettingsTab = 'presence' | 'sanctions' | 'notifications';
