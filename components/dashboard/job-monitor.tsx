"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { sileo } from "sileo";
import { apiClient } from "@/lib/api";
import { Job, JobStatus } from "@/types";

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: "success" | "error" | "info";
  read: boolean;
  jobId?: number;
}

interface JobMonitorContextType {
  activeJobs: Job[];
  addJob: (jobId: number, options?: { showToast?: boolean }) => void;
  isScraping: boolean;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  notify: (n: {
    title: string;
    description: string;
    type: "success" | "error" | "info" | "warning";
    jobId?: number;
    button?: { title: string; onClick: () => void };
  }) => void;
}

const JobMonitorContext = createContext<JobMonitorContextType | undefined>(
  undefined,
);

export function JobMonitorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeJobsMap, setActiveJobsMap] = useState<Map<number, Job>>(
    new Map(),
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const activeJobs = useMemo(
    () => Array.from(activeJobsMap.values()),
    [activeJobsMap],
  );
  const isScraping = activeJobs.length > 0;

  const removeJob = useCallback((jobId: number) => {
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
    (n: {
      title: string;
      description: string;
      type: "success" | "error" | "info" | "warning";
      jobId?: number;
      button?: { title: string; onClick: () => void };
    }) => {
      // Persistent record
      addNotification({
        title: n.title,
        description: n.description,
        type: n.type === "warning" ? "info" : n.type,
        jobId: n.jobId,
      });

      // Sileo interaction
      const options = {
        title: n.title,
        description: n.description,
        button: n.button,
      };

      switch (n.type) {
        case "success":
          sileo.success(options);
          break;
        case "error":
          sileo.error(options);
          break;
        case "warning":
          sileo.warning(options);
          break;
        default:
          sileo.info(options);
          break;
      }
    },
    [addNotification],
  );

  const monitorJob = useCallback(
    (jobId: number) => {
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
                (window.location.href = `/dashboard/datasets?jobId=${job.id}`),
            },
          });

          // Wait a bit before removing to let UI breathe
          setTimeout(() => removeJob(jobId), 3000);
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
    (jobId: number, options?: { showToast?: boolean }) => {
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
