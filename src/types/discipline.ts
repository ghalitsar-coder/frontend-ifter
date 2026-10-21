/**
 * Valid category types for disciplinary violations.
 */
export type DisciplineCategory =
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
  recorderName: string;
  recorderRole: string;
  studentTotalPoints: number;
  studentPointStatus: string;
  status: IncidentStatus;
};

/**
 * High-risk student under guidance watchlist (>= 30 points).
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
 * Form inputs for creating a new disciplinary violation incident.
 */
export type NewIncidentFormData = {
  studentName: string;
  studentNis: string;
  studentClass: string;
  categoryKey: DisciplineCategory;
  dateTime: string;
  location: string;
  description: string;
  immediateAction: string;
};
