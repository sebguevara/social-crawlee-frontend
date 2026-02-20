"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { sileo } from "sileo";
import { apiClient } from "@/lib/api";
import { Job, JobStatus } from "@/types";

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: "success" | "error" | "info" | "warning";
  read: boolean;
  jobId?: string;
}

interface NotificationOptions {
  title: string;
  description: string;
  type: "success" | "error" | "info" | "warning";
  jobId?: string;
  button?: { title: string; onClick: () => void };
}

interface JobMonitorContextType {
  activeJobs: Job[];
  addJob: (jobId: string, options?: { showToast?: boolean }) => void;
  isScraping: boolean;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  notify: (options: NotificationOptions) => void;
}

const JobMonitorContext = createContext<JobMonitorContextType | undefined>(
  undefined,
);

export function JobMonitorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeJobsMap, setActiveJobsMap] = useState<Map<string, Job>>(
    new Map(),
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifiedJobs = useRef<Set<string>>(new Set());

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const activeJobs = useMemo(
    () => Array.from(activeJobsMap.values()),
    [activeJobsMap],
  );
  const isScraping = activeJobs.length > 0;

  const removeJob = useCallback((jobId: string) => {
    setActiveJobsMap((prev) => {
      const next = new Map(prev);
      next.delete(jobId);
      return next;
    });
  }, []);

  const updateJob = useCallback((job: Job) => {
    setActiveJobsMap((prev) => {
      const next = new Map(prev);
      next.set(job.id, job);
      return next;
    });
  }, []);

  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "timestamp" | "read">) => {
      const notification: Notification = {
        ...n,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
    },
    [],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const notify = useCallback(
    (options: NotificationOptions) => {
      // Prevent duplicate notifications for the same jobId AND same title
      const notificationKey = options.jobId
        ? `${options.jobId}-${options.title}`
        : null;
      if (notificationKey && notifiedJobs.current.has(notificationKey)) {
        return;
      }

      // Persistent record
      addNotification({
        title: options.title,
        description: options.description,
        type: options.type,
        jobId: options.jobId,
      });

      if (notificationKey) {
        notifiedJobs.current.add(notificationKey);
      }

      // Sileo interaction
      const sileoOptions = {
        title: options.title,
        description: options.description,
        button: options.button,
      };

      switch (options.type) {
        case "success":
          sileo.success({
            ...sileoOptions,
            fill: "var(--sileo-state-success)",
            styles: {
              title: "!text-white",
              description: "!text-white/80",
            },
          });
          break;
        case "error":
          sileo.error({
            ...sileoOptions,
            fill: "var(--sileo-state-error)",
            styles: {
              title: "!text-white",
              description: "!text-white/80",
            },
          });
          break;
        case "warning":
          sileo.warning({
            ...sileoOptions,
            fill: "var(--sileo-state-warning)",
            styles: {
              title: "!text-white",
              description: "!text-white/80",
            },
          });
          break;
        default:
          sileo.info({
            ...sileoOptions,
            fill: "var(--sileo-state-info)",
            styles: {
              title: "!text-white",
              description: "!text-white/80",
            },
          });
          break;
      }
    },
    [addNotification],
  );

  const monitorJob = useCallback(
    (jobId: string) => {
      if (activeJobsMap.has(jobId)) return;

      const source = apiClient.openDashboardJobStream(jobId, {
        onProgress: (job) => {
          updateJob(job);
        },
        onDone: (job) => {
          updateJob(job);
          notify({
            title: "Scraping finalizado",
            description: `Ejecución #${job.id} de ${job.platform} completada con éxito.`,
            type: "success",
            jobId: job.id,
            button: {
              title: "Ver Resultados",
              onClick: () =>
                (window.location.href = `/dashboard/datasets/ds_${job.id}`),
            },
          });

          // Wait a bit before removing to let UI breathe
          setTimeout(() => removeJob(job.id), 3000);
        },
        onError: (error) => {
          removeJob(jobId);
          notify({
            title: "Error en scraping",
            description: `La ejecución #${jobId} falló: ${error}`,
            type: "error",
            jobId: jobId,
          });
        },
      });

      return () => source.close();
    },
    [activeJobsMap, removeJob, updateJob, notify],
  );

  const addJob = useCallback(
    (jobId: string, options?: { showToast?: boolean }) => {
      if (options?.showToast) {
        sileo.info({
          title: "Scraping iniciado",
          description: `Se ha creado la ejecución #${jobId}. Monitoreando progreso...`,
        });
      }
      void monitorJob(jobId);
    },
    [monitorJob],
  );

  return (
    <JobMonitorContext.Provider
      value={{
        activeJobs,
        addJob,
        isScraping,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        notify,
      }}
    >
      {children}
    </JobMonitorContext.Provider>
  );
}

export function useJobMonitor() {
  const context = useContext(JobMonitorContext);
  if (context === undefined) {
    throw new Error("useJobMonitor must be used within a JobMonitorProvider");
  }
  return context;
}

export function useNotifications() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    notify,
  } = useJobMonitor();
  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    notify,
  };
}
