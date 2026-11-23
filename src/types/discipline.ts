/**
 * Valid category types for disciplinary violations.
 */
export type DisciplineCategory =
  | 'atribut'
  | 'kerapihan'
  | 'perilaku'
  | 'lainnya'
  | 'keterlambatan'
  | 'seragam'
  | 'tatatertib'
  | 'barang_terlarang'
  | 'bullying';

/**
 * Status of the discipline incident resolution.
 */
export type IncidentStatus = 'baru' | 'tinjau' | 'tindak' | 'selesai';

/**
 * Single recorded disciplinary incident item.
 */
export type DisciplineIncident = {
  id: string;
  studentId?: number;
  violationTypeId?: number;
  violationCode: string;
  violationName: string;
  backendCategory: string;
  date: string;
  time: string;
  studentName: string;
  studentNis: string;
  studentClass: string;
  studentInitials: string;
  studentAvatarBg: string;
  categoryKey: DisciplineCategory;
  categoryLabel: string;
  points: number;
  description: string;
  location: string;
  immediateAction: string;
  recorderName: string;
  recorderRole: string;
  studentTotalPoints: number;
  studentPointStatus: string;
  status: IncidentStatus;
};

/**
 * High-risk student under guidance watchlist (>= 15 / 30 points).
 */
export type DisciplineWatchStudent = {
  id: string;
  name: string;
  nis: string;
  className: string;
  points: number;
  statusLabel: string;
  riskLevel: 'tinggi' | 'waspada' | 'tinjau';
  actionType: 'parent_call' | 'schedule_bk' | 'review_history';
};

/**
 * Discipline filter tabs.
 */
export type DisciplineQuickTab = 'all' | 'need_action' | 'resolved' | 'high_points';

/**
 * Filter state object for discipline incident list.
 */
export type DisciplineFilterState = {
  search: string;
  selectedClass: string;
  selectedCategory: string;
  selectedStatus: string;
  selectedPeriod: string;
  quickTab: DisciplineQuickTab;
};

/**
 * Form inputs for creating or editing a disciplinary violation incident.
 */
export type NewIncidentFormData = {
  studentId: number;
  studentName: string;
  studentNis: string;
  studentClass: string;
  violationTypeId: number;
  violationCode: string;
  violationName: string;
  backendCategory: string;
  points: number;
  date: string;
  time: string;
  location: string;
  description: string;
  immediateAction: string;
};
