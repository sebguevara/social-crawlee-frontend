"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Plus, Trash2 } from "lucide-react";
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

function parseTokenList(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseManualList(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

function sanitizePostUrl(value: string): string {
  const cleaned = value
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[)\],;]+$/g, "")
    .replace(/\.+$/g, "");

  try {
    const url = new URL(cleaned);
    url.hash = "";
    return url.toString();
  } catch {
    return cleaned;
  }
}

function validateFormWithLists(
  state: ScrapeFormState,
  input: { usernames: string[]; postUrls: string[] },
): ScrapeFormErrors {
  const errors: ScrapeFormErrors = {};
  const usernamesCount = input.usernames.length;
  const postUrlsCount = input.postUrls.length;

  if (state.jobType === JobType.PROFILE && usernamesCount === 0) {
    errors.usernames = "Ingresa al menos un usuario para continuar.";
  }

  if (state.jobType === JobType.POSTS) {
    const hasUsernames = usernamesCount > 0;
    const hasPostUrls = postUrlsCount > 0;

    if (hasUsernames && hasPostUrls) {
      errors.usernames = "Elige una sola opción: usuarios o URLs.";
      errors.postUrls = "Elige una sola opción: usuarios o URLs.";
    }

    if (!hasUsernames && !hasPostUrls) {
      errors.usernames = "Ingresa usuarios o URLs para continuar.";
      errors.postUrls = "Ingresa usuarios o URLs para continuar.";
    }
  }

  if (state.jobType === JobType.COMMENTS && postUrlsCount === 0) {
    errors.postUrls = "Ingresa al menos una URL de publicación.";
  }

  if (
    state.jobType !== JobType.PROFILE &&
    (state.maxItems < 1 || state.maxItems > 1000)
  ) {
    errors.maxItems = "El máximo de ítems debe estar entre 1 y 1000.";
  }
  if (state.jobType === JobType.POSTS && (state.daysBack < 1 || state.daysBack > 365)) {
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
  const [usernamesMode, setUsernamesMode] = useState<"manual" | "bulk">(
    "manual",
  );
  const [usernamesManual, setUsernamesManual] = useState<string[]>([""]);
  const [usernamesBulk, setUsernamesBulk] = useState("");
  const [postUrlsMode, setPostUrlsMode] = useState<"manual" | "bulk">("manual");
  const [postUrlsManual, setPostUrlsManual] = useState<string[]>([""]);
  const [postUrlsBulk, setPostUrlsBulk] = useState("");
  const [hasInteractedPostsInputs, setHasInteractedPostsInputs] =
    useState(false);

  const config = JOB_TYPES[form.jobType];
  const usernames =
    usernamesMode === "manual"
      ? parseManualList(usernamesManual)
      : parseTokenList(usernamesBulk);
  const postUrls =
    postUrlsMode === "manual"
      ? parseManualList(postUrlsManual)
      : parseTokenList(postUrlsBulk);
  const normalizedPostUrls = postUrls.map(sanitizePostUrl).filter(Boolean);
  const liveValidationErrors = validateFormWithLists(form, {
    usernames,
    postUrls: normalizedPostUrls,
  });
  const canSubmit = Object.keys(liveValidationErrors).length === 0;
  const executionBlockReason =
    form.jobType === JobType.POSTS && usernames.length > 0 && postUrls.length > 0
      ? "En publicaciones no puedes cargar usuarios y urls al mismo tiempo."
      : null;
  const sileoBlockReason =
    form.jobType === JobType.POSTS && usernames.length > 0 && postUrls.length > 0
      ? "En publicaciones no puedes cargar usuarios y urls al mismo tiempo."
      : null;
  const lastPostsWarningRef = useRef<string | null>(null);

  useEffect(() => {
    if (form.jobType !== JobType.POSTS) {
      lastPostsWarningRef.current = null;
      return;
    }
    if (!hasInteractedPostsInputs || !sileoBlockReason) return;
    if (lastPostsWarningRef.current === sileoBlockReason) return;
    lastPostsWarningRef.current = sileoBlockReason;
    sileo.warning({
      title: "Error de validación",
      description: sileoBlockReason,
    });
  }, [form.jobType, sileoBlockReason, hasInteractedPostsInputs]);

  const updateField = useCallback(
    <K extends keyof ScrapeFormState>(key: K, value: ScrapeFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const handleSubmit = async () => {
    const validationErrors = validateFormWithLists(form, {
      usernames,
      postUrls: normalizedPostUrls,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      let result;

      switch (form.jobType) {
        case JobType.PROFILE:
          result = await apiClient.scrapeProfiles({
            platform: form.platform,
            usernames,
          });
          break;
        case JobType.POSTS:
          result = await apiClient.scrapePosts({
            platform: form.platform,
            usernames: usernames.length > 0 ? usernames : undefined,
            postUrls:
              normalizedPostUrls.length > 0 ? normalizedPostUrls : undefined,
            daysBack: form.daysBack,
            maxItems: form.maxItems,
          });
          break;
        case JobType.COMMENTS:
          result = await apiClient.scrapeComments({
            platform: form.platform,
            postUrls: normalizedPostUrls,
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
                type="button"
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
                type="button"
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
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={usernamesMode === "manual" ? "default" : "outline"}
              size="sm"
              onClick={() => setUsernamesMode("manual")}
            >
              Manual
            </Button>
            <Button
              type="button"
              variant={usernamesMode === "bulk" ? "default" : "outline"}
              size="sm"
              onClick={() => setUsernamesMode("bulk")}
            >
              Lote
            </Button>
          </div>
          {usernamesMode === "manual" ? (
            <div className="flex flex-col gap-2">
              {usernamesManual.map((value, index) => (
                <div
                  key={`username-${index}`}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={value}
                    onChange={(e) => {
                      const next = [...usernamesManual];
                      next[index] = e.target.value;
                      setUsernamesManual(next);
                      setHasInteractedPostsInputs(true);
                      setErrors((prev) => ({ ...prev, usernames: undefined }));
                    }}
                    placeholder="@usuario"
                    className="bg-card font-mono text-sm"
                  />
                  {usernamesManual.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        const next = usernamesManual.filter(
                          (_, i) => i !== index,
                        );
                        setUsernamesManual(next.length > 0 ? next : [""]);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit gap-1.5"
                onClick={() => setUsernamesManual((prev) => [...prev, ""])}
              >
                <Plus className="h-4 w-4" />
                Agregar usuario
              </Button>
            </div>
          ) : (
            <Textarea
              placeholder="Pega usuarios separados por comas, espacios o saltos de línea..."
              value={usernamesBulk}
              onChange={(e) => {
                setUsernamesBulk(e.target.value);
                setHasInteractedPostsInputs(true);
                setErrors((prev) => ({ ...prev, usernames: undefined }));
              }}
              rows={4}
              className="resize-none bg-card font-mono text-sm"
            />
          )}
          {errors.usernames && (
            <p className="text-xs text-red-500">{errors.usernames}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Cargá uno por input o pega varios con comas, espacios o saltos de
            línea.
          </p>
        </div>
      )}

      {/* Post URLs input */}
      {config.requiresPostUrls && (
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">
            Post URLs{" "}
            {form.jobType === JobType.POSTS && (
              <span className="text-muted-foreground"></span>
            )}
          </Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={postUrlsMode === "manual" ? "default" : "outline"}
              size="sm"
              onClick={() => setPostUrlsMode("manual")}
            >
              Manual
            </Button>
            <Button
              type="button"
              variant={postUrlsMode === "bulk" ? "default" : "outline"}
              size="sm"
              onClick={() => setPostUrlsMode("bulk")}
            >
              Lote
            </Button>
          </div>
          {postUrlsMode === "manual" ? (
            <div className="flex flex-col gap-2">
              {postUrlsManual.map((value, index) => (
                <div
                  key={`post-url-${index}`}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={value}
                    onChange={(e) => {
                      const next = [...postUrlsManual];
                      next[index] = e.target.value;
                      setPostUrlsManual(next);
                      setHasInteractedPostsInputs(true);
                      setErrors((prev) => ({ ...prev, postUrls: undefined }));
                    }}
                    placeholder="https://..."
                    className="bg-card font-mono text-sm"
                  />
                  {postUrlsManual.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        const next = postUrlsManual.filter(
                          (_, i) => i !== index,
                        );
                        setPostUrlsManual(next.length > 0 ? next : [""]);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit gap-1.5"
                onClick={() => setPostUrlsManual((prev) => [...prev, ""])}
              >
                <Plus className="h-4 w-4" />
                Agregar URL
              </Button>
            </div>
          ) : (
            <Textarea
              placeholder="Pega URLs separadas por comas, espacios o saltos de línea..."
              value={postUrlsBulk}
              onChange={(e) => {
                setPostUrlsBulk(e.target.value);
                setHasInteractedPostsInputs(true);
                setErrors((prev) => ({ ...prev, postUrls: undefined }));
              }}
              rows={4}
              className="resize-none bg-card font-mono text-sm"
            />
          )}
          {errors.postUrls && (
            <p className="text-xs text-red-500">{errors.postUrls}</p>
          )}
        </div>
      )}

      {/* Numeric inputs */}
      {form.jobType !== JobType.PROFILE && (
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
          {form.jobType === JobType.POSTS && (
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
      )}

      {/* Preview */}
      <div className="rounded-xl border border-border/50 bg-[#0a0a0b] p-5">
        <p className="mb-3 text-xs font-medium text-[#6b7280]">
          Vista previa del request
        </p>
        <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-[#a8b4c0]">
          {JSON.stringify(
            {
              platform: form.platform,
              ...(config.requiresUsernames && usernames.length > 0
                ? {
                    usernames,
                  }
                : {}),
              ...(config.requiresPostUrls && normalizedPostUrls.length > 0
                ? {
                    postUrls: normalizedPostUrls,
                  }
                : {}),
              ...(config.requiresDaysBack ? { daysBack: form.daysBack } : {}),
              ...(form.jobType !== JobType.PROFILE
                ? { maxItems: form.maxItems }
                : {}),
            },
            null,
            2,
          )}
        </pre>
      </div>

      {/* Submit */}
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        {executionBlockReason && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {executionBlockReason}
          </p>
        )}
        <Button
          type="button"
          size="lg"
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          className="btn-primary-glow w-full gap-2 text-primary-foreground sm:w-auto"
        >
          {loading ? "Creando ejecución..." : "Iniciar scraping"}
          <Rocket className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
