/* ──────────────────────────────────────────────────────────────
   Social Crawlee – Domain Types
   Strict interfaces for the entire scraping platform.
   ────────────────────────────────────────────────────────────── */

// ─── Enums ───────────────────────────────────────────────────

export enum Platform {
  INSTAGRAM = "INSTAGRAM",
  FACEBOOK = "FACEBOOK",
  X = "X",
  TIKTOK = "TIKTOK",
}

export enum JobType {
  PROFILE = "PROFILE",
  POSTS = "POSTS",
  COMMENTS = "COMMENTS",
}

export enum JobStatus {
  QUEUED = "QUEUED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// ─── API Request Payloads ────────────────────────────────────

export interface ScrapeProfilesRequest {
  platform: Platform;
  usernames: string[];
}

export interface ScrapePostsRequest {
  platform: Platform;
  postUrls?: string[];
  usernames?: string[];
  daysBack: number;
  maxItems: number;
}

export interface ScrapeCommentsRequest {
  platform: Platform;
  postUrls: string[];
  maxItems: number;
}

export interface DatasetRequest {
  jobId?: string;
  datasetId?: string;
}

export interface JobStatusRequest {
  jobId: string;
}

// ─── API Response Types ──────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface JobCreatedResponse {
  jobId: string;
  datasetId: string;
  status: JobStatus;
  platform: Platform;
  jobType: JobType;
  createdAt: string;
}

export interface JobStatusResponse {
  jobId: string;
  datasetId: string;
  status: JobStatus;
  platform: Platform;
  jobType: JobType;
  progress: number;
  totalItems: number;
  processedItems: number;
  createdAt: string;
  updatedAt: string;
  finishedAt?: string;
  errorMessage?: string;
}

export interface DatasetResponse {
  datasetId: string;
  jobId: string;
  items: DatasetItem[];
  totalItems: number;
}

// ─── Domain Models ───────────────────────────────────────────

export interface Job {
  id: string;
  datasetId: string;
  platform: Platform;
  jobType: JobType;
  status: JobStatus;
  progress: number;
  totalItems: number;
  processedItems: number;
  input: JobInput;
  createdAt: string;
  updatedAt: string;
  finishedAt?: string;
  errorMessage?: string;
}

export interface JobInput {
  usernames?: string[];
  postUrls?: string[];
  daysBack?: number;
  maxItems?: number;
}

export interface DatasetItem {
  id: string;
  jobId: string;
  url?: string;
  data: Record<string, unknown>;
  scrapedAt: string;
}

// ─── Profile Data ────────────────────────────────────────────

export interface ScrapedProfile {
  username: string;
  fullName: string;
  bio: string;
  profilePicUrl: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  externalUrl?: string;
  platform: Platform;
}

// ─── Post Data ───────────────────────────────────────────────

export interface ScrapedPost {
  postId: string;
  postUrl: string;
  username: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL" | "TEXT";
  mediaUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  publishedAt: string;
  platform: Platform;
}

// ─── Comment Data ────────────────────────────────────────────

export interface ScrapedComment {
  commentId: string;
  postUrl: string;
  username: string;
  text: string;
  likesCount: number;
  repliesCount: number;
  publishedAt: string;
  platform: Platform;
}

// ─── Dashboard Statistics ────────────────────────────────────

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalItemsScraped: number;
  jobsByPlatform: Record<Platform, number>;
  jobsByType: Record<JobType, number>;
  recentJobs: Job[];
}

export interface DashboardSummaryResponse extends DashboardStats {}

export interface DashboardJobsListRequest {
  page?: number;
  limit?: number;
  status?: JobStatus | "ALL";
  platform?: Platform | "ALL";
  type?: JobType | "ALL";
}

export interface DashboardDatasetsListRequest {
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Navigation ──────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

// ─── Form State ──────────────────────────────────────────────

export interface ScrapeFormState {
  platform: Platform;
  jobType: JobType;
  usernames: string;
  postUrls: string;
  daysBack: number;
  maxItems: number;
}

export type ScrapeFormErrors = Partial<Record<keyof ScrapeFormState, string>>;
