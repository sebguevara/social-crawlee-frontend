"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import {
  SiInstagram,
  SiFacebook,
  SiX,
  SiTiktok,
} from "@icons-pack/react-simple-icons";
import { sileo } from "sileo";
import {
  Platform,
  JobType,
  type ScrapeFormState,
  type ScrapeFormErrors,
} from "@/types";
import { PLATFORMS, JOB_TYPES, DEFAULTS } from "@/config/constants";
import { apiClient } from "@/lib/api";
import { useJobMonitor } from "@/components/dashboard/job-monitor";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  [Platform.INSTAGRAM]: SiInstagram,
  [Platform.FACEBOOK]: SiFacebook,
  [Platform.X]: SiX,
  [Platform.TIKTOK]: SiTiktok,
};

function validateForm(state: ScrapeFormState): ScrapeFormErrors {
  const errors: ScrapeFormErrors = {};
  const config = JOB_TYPES[state.jobType];

  if (config.requiresUsernames && !state.usernames.trim()) {
    errors.usernames = "Se requiere al menos un usuario.";
  }
  if (
    config.requiresPostUrls &&
    state.jobType === JobType.COMMENTS &&
    !state.postUrls.trim()
  ) {
    errors.postUrls = "Se requiere al menos una URL de publicación.";
  }
  if (state.maxItems < 1 || state.maxItems > 1000) {
    errors.maxItems = "El máximo de ítems debe estar entre 1 y 1000.";
  }
  if (config.requiresDaysBack && (state.daysBack < 1 || state.daysBack > 365)) {
    errors.daysBack = "Los días hacia atrás deben estar entre 1 y 365.";
  }

  return errors;
}

export function ScrapeForm() {
  const router = useRouter();
  const { addJob } = useJobMonitor();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<ScrapeFormState>({
    platform: DEFAULTS.platform,
    jobType: DEFAULTS.jobType,
    usernames: "",
    postUrls: "",
    daysBack: DEFAULTS.daysBack,
    maxItems: DEFAULTS.maxItems,
  });

  const [errors, setErrors] = useState<ScrapeFormErrors>({});

  const config = JOB_TYPES[form.jobType];

  const updateField = useCallback(
    <K extends keyof ScrapeFormState>(key: K, value: ScrapeFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const handleSubmit = async () => {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const usernames = form.usernames
        .split(/[,\n]/)
        .map((u) => u.trim())
        .filter(Boolean);
      const postUrls = form.postUrls
        .split(/[,\n]/)
        .map((u) => u.trim())
        .filter(Boolean);

      let result;

      switch (form.jobType) {
        case JobType.PROFILE:
          result = await apiClient.scrapeProfiles({
            platform: form.platform,
            usernames,
            maxItems: form.maxItems,
          });
          break;
        case JobType.POSTS:
          result = await apiClient.scrapePosts({
            platform: form.platform,
            usernames: usernames.length > 0 ? usernames : undefined,
            postUrls: postUrls.length > 0 ? postUrls : undefined,
            daysBack: form.daysBack,
            maxItems: form.maxItems,
          });
          break;
        case JobType.COMMENTS:
          result = await apiClient.scrapeComments({
            platform: form.platform,
            postUrls,
            daysBack: form.daysBack,
            maxItems: form.maxItems,
          });
          break;
      }

      if (result.success && result.data) {
        addJob(result.data.jobId, { showToast: true });
        router.push(`/dashboard/jobs/${result.data.jobId}`);
      } else {
        sileo.error({
          title: "No se pudo crear la ejecución",
          description: result.error ?? "Error desconocido",
        });
      }
    } catch {
      sileo.error({
        title: "Error de red",
        description: "No se pudo conectar con el servidor API.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Platform selector */}
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-medium text-foreground">
          Plataforma
        </Label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Object.values(PLATFORMS).map((p) => {
            const Icon = PLATFORM_ICONS[p.key];
            const isActive = form.platform === p.key;
            return (
              <button
                key={p.key}
                onClick={() => updateField("platform", p.key)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-all",
                  isActive
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/50 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                <Icon size={24} />
                <span className="font-medium">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Job type selector */}
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-medium text-foreground">
          Tipo de scraping
        </Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Object.values(JOB_TYPES).map((jt) => {
            const isActive = form.jobType === jt.key;
            return (
              <button
                key={jt.key}
                onClick={() => updateField("jobType", jt.key)}
                className={cn(
                  "flex flex-col gap-1 rounded-xl border p-4 text-left transition-all",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-card hover:border-primary/30",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-primary" : "text-foreground",
                  )}
                >
                  {jt.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {jt.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Usernames input */}
      {config.requiresUsernames && (
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">
            Usuarios
          </Label>
          <Textarea
            placeholder="Ingresa usuarios, uno por línea o separados por coma..."
            value={form.usernames}
            onChange={(e) => updateField("usernames", e.target.value)}
            rows={4}
            className="resize-none bg-card font-mono text-sm"
          />
          {errors.usernames && (
            <p className="text-xs text-red-500">{errors.usernames}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Separa múltiples usuarios con comas o saltos de línea.
          </p>
        </div>
      )}

      {/* Post URLs input */}
      {config.requiresPostUrls && (
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">
            Post URLs{" "}
            {form.jobType === JobType.POSTS && (
              <span className="text-muted-foreground">(opcional)</span>
            )}
          </Label>
          <Textarea
            placeholder="Ingresa URLs de publicaciones, una por línea..."
            value={form.postUrls}
            onChange={(e) => updateField("postUrls", e.target.value)}
            rows={4}
            className="resize-none bg-card font-mono text-sm"
          />
          {errors.postUrls && (
            <p className="text-xs text-red-500">{errors.postUrls}</p>
          )}
        </div>
      )}

      {/* Numeric inputs */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">
            Máximo de ítems
          </Label>
          <Input
            type="number"
            min={1}
            max={1000}
            value={form.maxItems}
            onChange={(e) =>
              updateField("maxItems", parseInt(e.target.value) || 1)
            }
            className="bg-card font-mono"
          />
          {errors.maxItems && (
            <p className="text-xs text-red-500">{errors.maxItems}</p>
          )}
        </div>

        {config.requiresDaysBack && (
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">
              Días hacia atrás
            </Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={form.daysBack}
              onChange={(e) =>
                updateField("daysBack", parseInt(e.target.value) || 1)
              }
              className="bg-card font-mono"
            />
            {errors.daysBack && (
              <p className="text-xs text-red-500">{errors.daysBack}</p>
            )}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-border/50 bg-[#0a0a0b] p-5">
        <p className="mb-3 text-xs font-medium text-[#6b7280]">
          Vista previa del request
        </p>
        <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-[#a8b4c0]">
          {JSON.stringify(
            {
              platform: form.platform,
              ...(config.requiresUsernames && form.usernames.trim()
                ? {
                    usernames: form.usernames
                      .split(/[,\n]/)
                      .map((u) => u.trim())
                      .filter(Boolean),
                  }
                : {}),
              ...(config.requiresPostUrls && form.postUrls.trim()
                ? {
                    postUrls: form.postUrls
                      .split(/[,\n]/)
                      .map((u) => u.trim())
                      .filter(Boolean),
                  }
                : {}),
              ...(config.requiresDaysBack ? { daysBack: form.daysBack } : {}),
              maxItems: form.maxItems,
            },
            null,
            2,
          )}
        </pre>
      </div>

      {/* Submit */}
      <Button
        size="lg"
        onClick={handleSubmit}
        disabled={loading}
        className="btn-primary-glow w-full gap-2 text-primary-foreground sm:w-auto sm:self-end"
      >
        <Send className="h-4 w-4" />
        {loading ? "Creando ejecución..." : "Iniciar scraping"}
      </Button>
    </div>
  );
}
