export enum TransactionCategory {
  ACQUISITION = 'acquisition',
  SALE = 'sale',
  LICENSE_IN = 'license_in',
  LICENSE_OUT = 'license_out',
  SECURITY = 'security',
  MERGER_IN = 'merger_in',
  MERGER_OUT = 'merger_out',
  OPTION = 'option',
  COURT_ORDER = 'court_order',
  MISSING = 'missing',
  OTHER = 'other',
  RELEASE = 'release',
}

export enum PatentStatus {
  APPLICATION = 'application',
  GRANTED = 'granted',
  EXPIRED = 'expired',
  ABANDONED = 'abandoned',
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  TENANT_USER = 'tenant_user',
}

export enum OrgType {
  COMPANY = 1,
  BANK = 2,
  LAW_FIRM = 3,
  UNIVERSITY = 4,
  GOVERNMENT = 5,
}

export enum ShareType {
  STANDARD = 0,
  SAMPLE = 2,
  DASHBOARD = 9,
}

export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum TitleChainStatus {
  COMPLETE = 'complete',
  BROKEN = 'broken',
  UNANALYZABLE = 'unanalyzable',
}
