import { API_CONFIG } from "@/config/constants";
import {
  JobStatus as JobStatusEnum,
  JobType as JobTypeEnum,
  Platform as PlatformEnum,
} from "@/types";
import type {
  ApiResponse,
  DashboardSummaryResponse,
  DashboardJobsListRequest,
  DashboardDatasetsListRequest,
  DatasetItem,
  DatasetRequest,
  DatasetResponse,
  Job,
  JobCreatedResponse,
  JobStatus,
  JobStatusRequest,
  JobStatusResponse,
  JobType,
  PaginatedResponse,
  Platform,
  ScrapeCommentsRequest,
  ScrapePostsRequest,
  ScrapeProfilesRequest,
} from "@/types";

type BackendJobStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
type BackendJobType = "PROFILE" | "POSTS" | "COMMENTS";
type BackendPlatform = "INSTAGRAM" | "FACEBOOK" | "TIKTOK" | "X";

type BackendDashboardJob = {
  id: string;
  datasetId: string;
  platform: BackendPlatform;
  jobType: BackendJobType;
  status: BackendJobStatus;
  progress: number;
  totalItems: number;
  processedItems: number;
  input: {
    usernames?: string[];
    postUrls?: string[];
    daysBack?: number;
    maxItems?: number;
  };
  createdAt: string;
  updatedAt: string;
  finishedAt?: string;
  errorMessage?: string;
};

type BatchQueueResponse = {
  data?: Array<{ status: "QUEUED" | "ERROR"; jobId?: string }>;
  message?: string;
};

const toFrontendStatus = (status: BackendJobStatus): JobStatus => {
  if (status === "QUEUED") return JobStatusEnum.QUEUED;
  if (status === "RUNNING") return JobStatusEnum.RUNNING;
  if (status === "COMPLETED") return JobStatusEnum.COMPLETED;
  return JobStatusEnum.FAILED;
};

const toFrontendType = (type: BackendJobType): JobType => {
  if (type === "PROFILE") return JobTypeEnum.PROFILE;
  if (type === "POSTS") return JobTypeEnum.POSTS;
  return JobTypeEnum.COMMENTS;
};

const toFrontendPlatform = (platform: BackendPlatform): Platform => {
  if (platform === "INSTAGRAM") return PlatformEnum.INSTAGRAM;
  if (platform === "FACEBOOK") return PlatformEnum.FACEBOOK;
  if (platform === "TIKTOK") return PlatformEnum.TIKTOK;
  return PlatformEnum.X;
};

const mapBackendJob = (job: BackendDashboardJob): Job => ({
  id: job.id,
  datasetId: job.datasetId,
  platform: toFrontendPlatform(job.platform),
  jobType: toFrontendType(job.jobType),
  status: toFrontendStatus(job.status),
  progress: job.progress,
  totalItems: job.totalItems,
  processedItems: job.processedItems,
  input: {
    usernames: job.input.usernames,
    postUrls: job.input.postUrls,
    daysBack: job.input.daysBack,
    maxItems: job.input.maxItems ?? 0,
  },
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
  finishedAt: job.finishedAt,
  errorMessage: job.errorMessage,
});

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async post<T>(
    endpoint: string,
    body: unknown,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error:
            error.error ??
            error.message ??
            `Request failed (${response.status})`,
        };
      }

      const data = (await response.json()) as T;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error:
            error.error ??
            error.message ??
            `Request failed (${response.status})`,
        };
      }

      const data = (await response.json()) as T;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private streamUrl(endpoint: string, query: Record<string, string | number>) {
    const qs = new URLSearchParams(
      Object.entries(query).map(([k, v]) => [k, String(v)]),
    );
    return `${this.baseUrl}${endpoint}?${qs.toString()}`;
  }

  async scrapeProfiles(
    payload: ScrapeProfilesRequest,
  ): Promise<ApiResponse<JobCreatedResponse>> {
    const response = await this.post<BatchQueueResponse>(
      API_CONFIG.endpoints.scrapeProfiles,
      payload,
    );
    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }

    const firstQueued = response.data.data?.find(
      (item) => item.status === "QUEUED" && item.jobId,
    );
    if (!firstQueued?.jobId) {
      return {
        success: false,
        error: response.data.message ?? "No se pudo crear el job",
      };
    }

    return {
      success: true,
      data: {
        jobId: firstQueued.jobId,
        datasetId: `ds_${firstQueued.jobId}`,
        status: JobStatusEnum.QUEUED,
        platform: payload.platform,
        jobType: JobTypeEnum.PROFILE,
        createdAt: new Date().toISOString(),
      },
    };
  }

  async scrapePosts(
    payload: ScrapePostsRequest,
  ): Promise<ApiResponse<JobCreatedResponse>> {
    const response = await this.post<BatchQueueResponse>(
      API_CONFIG.endpoints.scrapePosts,
      payload,
    );
    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }

    const firstQueued = response.data.data?.find(
      (item) => item.status === "QUEUED" && item.jobId,
    );
    if (!firstQueued?.jobId) {
      return {
        success: false,
        error: response.data.message ?? "No se pudo crear el job",
      };
    }

    return {
      success: true,
      data: {
        jobId: firstQueued.jobId,
        datasetId: `ds_${firstQueued.jobId}`,
        status: JobStatusEnum.QUEUED,
        platform: payload.platform,
        jobType: JobTypeEnum.POSTS,
        createdAt: new Date().toISOString(),
      },
    };
  }

  async scrapeComments(
    payload: ScrapeCommentsRequest,
  ): Promise<ApiResponse<JobCreatedResponse>> {
    const response = await this.post<BatchQueueResponse>(
      API_CONFIG.endpoints.scrapeComments,
      payload,
    );
    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }

    const firstQueued = response.data.data?.find(
      (item) => item.status === "QUEUED" && item.jobId,
    );
    if (!firstQueued?.jobId) {
      return {
        success: false,
        error: response.data.message ?? "No se pudo crear el job",
      };
    }

    return {
      success: true,
      data: {
        jobId: firstQueued.jobId,
        datasetId: `ds_${firstQueued.jobId}`,
        status: JobStatusEnum.QUEUED,
        platform: payload.platform,
        jobType: JobTypeEnum.COMMENTS,
        createdAt: new Date().toISOString(),
      },
    };
  }

  async getJobStatus(
    payload: JobStatusRequest,
  ): Promise<ApiResponse<JobStatusResponse>> {
    return this.post<JobStatusResponse>(
      API_CONFIG.endpoints.jobStatus,
      payload,
    );
  }

  async getDashboardSummary(): Promise<ApiResponse<DashboardSummaryResponse>> {
    const response = await this.post<
      Omit<
        DashboardSummaryResponse,
        "recentJobs" | "jobsByPlatform" | "jobsByType"
      > & {
        jobsByPlatform: Record<string, number>;
        jobsByType: Record<string, number>;
        recentJobs: BackendDashboardJob[];
      }
    >(API_CONFIG.endpoints.dashboardSummary, {});

    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }

    const mapped: DashboardSummaryResponse = {
      totalJobs: response.data.totalJobs,
      activeJobs: response.data.activeJobs,
      completedJobs: response.data.completedJobs,
      failedJobs: response.data.failedJobs,
      totalItemsScraped: response.data.totalItemsScraped,
      jobsByPlatform: {
        INSTAGRAM: response.data.jobsByPlatform.INSTAGRAM ?? 0,
        FACEBOOK: response.data.jobsByPlatform.FACEBOOK ?? 0,
        TIKTOK: response.data.jobsByPlatform.TIKTOK ?? 0,
        X: response.data.jobsByPlatform.X ?? 0,
      },
      jobsByType: {
        PROFILE: response.data.jobsByType.PROFILE ?? 0,
        POSTS: response.data.jobsByType.POSTS ?? 0,
        COMMENTS: response.data.jobsByType.COMMENTS ?? 0,
      },
      recentJobs: response.data.recentJobs.map(mapBackendJob),
    };

    return { success: true, data: mapped };
  }

  async listDashboardJobs(
    payload: DashboardJobsListRequest,
  ): Promise<ApiResponse<PaginatedResponse<Job>>> {
    const response = await this.post<{
      data: BackendDashboardJob[];
      pagination: PaginatedResponse<Job>["pagination"];
    }>(API_CONFIG.endpoints.dashboardJobsList, payload);

    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }

    return {
      success: true,
      data: {
        data: response.data.data.map(mapBackendJob),
        pagination: response.data.pagination,
      },
    };
  }

  async getDashboardJobDetail(jobId: string): Promise<ApiResponse<Job>> {
    const response = await this.post<BackendDashboardJob>(
      API_CONFIG.endpoints.dashboardJobDetail,
      { jobId },
    );
    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }
    return { success: true, data: mapBackendJob(response.data) };
  }

  openDashboardJobStream(
    jobId: string,
    handlers: {
      onProgress: (job: Job) => void;
      onDone?: (job: Job) => void;
      onError?: (error: string) => void;
    },
  ) {
    const source = new EventSource(
      this.streamUrl(API_CONFIG.endpoints.dashboardJobStream, { jobId }),
    );

    source.addEventListener("progress", (event) => {
      const payload = JSON.parse(
        (event as MessageEvent).data,
      ) as BackendDashboardJob;
      handlers.onProgress(mapBackendJob(payload));
    });

    source.addEventListener("done", (event) => {
      const payload = JSON.parse(
        (event as MessageEvent).data,
      ) as BackendDashboardJob;
      handlers.onDone?.(mapBackendJob(payload));
    });

    source.addEventListener("error", (event: MessageEvent) => {
      if (event.data) {
        try {
          const payload = JSON.parse(event.data) as {
            error?: string;
          };
          handlers.onError?.(payload.error ?? "Stream error");
        } catch {
          // Si no es JSON, ignoramos para que no explote
        }
      }
    });

    source.onerror = () => {
      // EventSource readyState: 0=CONNECTING, 1=OPEN, 2=CLOSED
      if (source.readyState === 2) {
        handlers.onError?.("Se cerró la conexión en tiempo real");
      }
      // Cuando es 0 (CONNECTING), es que está intentando reconectar automáticamente.
      // No mandamos error para no llenar la pantalla de toasts.
    };

    return source;
  }

  async getDataset(params: { jobId?: string; datasetId: string }): Promise<
    ApiResponse<
      DatasetResponse & {
        jobId?: string;
        datasetId?: string;
        items: DatasetItem[];
      }
    >
  > {
    const response = await this.post<{
      jobId?: string;
      datasetId?: string;
      items: any[];
    }>(API_CONFIG.endpoints.dataset, {
      jobId: params.jobId,
      datasetId: params.datasetId,
    });

    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }

    // Normalize items: move non-metadata fields into .data
    const metadataKeys = [
      "id",
      "jobId",
      "scrapedAt",
      "url",
      "platform",
      "type",
    ];
    const items: DatasetItem[] = response.data.items.map((item, index) => {
      const data: Record<string, unknown> = {};
      Object.keys(item).forEach((key) => {
        if (!metadataKeys.includes(key)) {
          data[key] = item[key];
        }
      });

      return {
        id: item.id || `item-${index}`,
        jobId: (item.jobId ||
          params.jobId ||
          params.datasetId.replace("ds_", "")) as string,
        scrapedAt: item.scrapedAt || new Date().toISOString(),
        data,
      };
    });

    return {
      success: true,
      data: {
        ...response.data,
        items,
        totalItems: items.length,
        jobId:
          response.data.jobId ??
          params.jobId ??
          String(params.datasetId.replace("ds_", "")),
        datasetId: response.data.datasetId ?? params.datasetId ?? "",
      },
    };
  }

  async listDashboardDatasets(
    payload: DashboardDatasetsListRequest,
  ): Promise<ApiResponse<PaginatedResponse<Job>>> {
    const response = await this.post<{
      data: BackendDashboardJob[];
      pagination: PaginatedResponse<Job>["pagination"];
    }>(API_CONFIG.endpoints.dashboardDatasetsList, payload);

    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }

    return {
      success: true,
      data: {
        data: response.data.data.map(mapBackendJob),
        pagination: response.data.pagination,
      },
    };
  }

  async stopJob(jobId: string): Promise<ApiResponse<{ success: true }>> {
    return this.post<{ success: true }>(API_CONFIG.endpoints.stopJob, {
      jobId,
    });
  }

  async deleteJob(jobId: string): Promise<ApiResponse<{ success: true }>> {
    return this.post<{ success: true }>(API_CONFIG.endpoints.deleteJob, {
      jobId,
    });
  }
}

export const apiClient = new ApiClient(API_CONFIG.baseUrl);
