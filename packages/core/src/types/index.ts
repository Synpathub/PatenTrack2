import { OrgType, UserRole, PatentStatus, TransactionCategory, TitleChainStatus, ShareType, JobStatus } from '../constants';

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  type: OrgType;
  subscription: {
    plan: string;
    status: string;
    expiresAt?: Date;
  };
  settings: {
    allowedDomains?: string[];
    maxUsers?: number;
    features?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  tenantId: number;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: number;
  tenantId: number;
  name: string;
  entityId?: number;
  status: 'active' | 'inactive' | 'archived';
  description?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patent {
  id: number;
  tenantId: number;
  applicationNum: string;
  grantNum?: string;
  title: string;
  abstract?: string;
  filingDate: Date;
  grantDate?: Date;
  expirationDate?: Date;
  status: PatentStatus;
  companyId?: number;
  cpcCodes?: string[];
  claims?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: number;
  tenantId: number;
  patentId: number;
  reelNo?: string;
  frameNo?: string;
  conveyanceText?: string;
  typeId: TransactionCategory;
  recordDate?: Date;
  executionDate?: Date;
  pagesScanned?: number;
  correspondenceAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionParty {
  id: number;
  transactionId: number;
  entityId?: number;
  role: 'assignor' | 'assignee';
  rawName: string;
  normalizedName?: string;
  createdAt: Date;
}

export interface Entity {
  id: number;
  canonicalName: string;
  domain?: string;
  logoUrl?: string;
  entityType: 'company' | 'individual' | 'organization' | 'government' | 'university';
  website?: string;
  headquarters?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntityNameVariant {
  id: number;
  entityId: number;
  rawName: string;
  source: string;
  normalizedBy?: string;
  confidence?: number;
  isVerified: boolean;
  createdAt: Date;
}

export interface Inventor {
  id: number;
  patentId: number;
  name: string;
  deduplicatedId?: number;
  city?: string;
  state?: string;
  country?: string;
  sequence?: number;
  createdAt: Date;
}

export interface TitleChain {
  id: number;
  tenantId: number;
  patentId: number;
  status: TitleChainStatus;
  chain: {
    nodes: Array<{
      transactionId: number;
      entityId?: number;
      entityName: string;
      date?: Date;
      type: TransactionCategory;
    }>;
    edges: Array<{
      from: number;
      to: number;
      transactionId: number;
    }>;
  };
  missingLinks?: {
    gaps: Array<{
      fromEntity: string;
      toEntity: string;
      expectedDate?: Date;
    }>;
  };
  reason?: string;
  analyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OwnershipTree {
  id: number;
  tenantId: number;
  companyId: number;
  tabId?: string;
  treeData: {
    nodes: Array<{
      id: string;
      label: string;
      type: 'company' | 'patent' | 'transaction';
      metadata?: Record<string, unknown>;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      label?: string;
    }>;
  };
  transactionCount: number;
  assetsCount: number;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShareLink {
  id: number;
  tenantId: number;
  code: string;
  createdById: number;
  type: ShareType;
  resourceType?: string;
  resourceId?: number;
  expiresAt?: Date;
  showOtherCompanies: boolean;
  accessCount: number;
  lastAccessedAt?: Date;
  createdAt: Date;
}

export interface LawFirm {
  id: number;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attorney {
  id: number;
  name: string;
  registrationNumber?: string;
  lawFirmId?: number;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IngestionJob {
  id: number;
  dataSourceId: number;
  status: JobStatus;
  progress: number;
  errorMessage?: string;
  recordsProcessed?: number;
  recordsFailed?: number;
  metadata?: Record<string, unknown>;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: number;
  tenantId: number;
  type: string;
  subject: string;
  subjectType: string;
  complete: boolean;
  professionalId?: number;
  assignedTo?: number;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: number;
  tenantId: number;
  activityId: number;
  userId: number;
  content: string;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timeline {
  id: number;
  tenantId: number;
  companyId?: number;
  patentId?: number;
  eventDate: Date;
  eventType: string;
  patentNumber?: string;
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
