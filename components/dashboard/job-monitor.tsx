"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { toast } from "sonner";
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
  addJob: (jobId: number) => void;
  isScraping: boolean;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
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

  const monitorJob = useCallback(
    (jobId: number) => {
      if (activeJobsMap.has(jobId)) return;

      const source = apiClient.openDashboardJobStream(jobId, {
        onProgress: (job) => {
          updateJob(job);
        },
        onDone: (job) => {
          updateJob(job);
          const title = `Scraping finalizado`;
          const description = `Job #${job.id} (${job.platform}) se completó con éxito.`;

          toast.success(title, { description });
          addNotification({
            title,
            description,
            type: "success",
            jobId: job.id,
          });

          // Esperar un poco antes de remover para que la UI respire
          setTimeout(() => removeJob(jobId), 3000);
        },
        onError: (error) => {
          removeJob(jobId);
          const title = `Error en scraping`;
          const description = `El job #${jobId} falló: ${error}`;

          toast.error(title, { description });
          addNotification({
            title,
            description,
            type: "error",
            jobId: jobId,
          });
        },
      });

      return () => source.close();
    },
    [activeJobsMap, removeJob, updateJob],
  );

  const addJob = useCallback(
    (jobId: number) => {
      // Iniciar monitoreo inmediatamente si no existe
      void monitorJob(jobId);
    },
    [monitorJob],
  );

  // Al montar, podríamos buscar jobs que ya estén corriendo en el dashboard
  // Pero por ahora, confiaremos en los que se agregan via addJob o
  // una recarga inicial si implementamos persistencia.

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
  } = useJobMonitor();
  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
