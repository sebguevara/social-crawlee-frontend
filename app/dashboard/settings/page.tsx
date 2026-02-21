"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { User, Mail, AtSign, Shield, Clock, Save, AlertTriangle } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api";
import { sileo } from "sileo";

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dangerPhrase, setDangerPhrase] = useState("");
  const [dangerEmail, setDangerEmail] = useState("");
  const [dangerAcknowledge, setDangerAcknowledge] = useState(false);
  const [isPurgingData, setIsPurgingData] = useState(false);

  const expectedEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
  const hasValidPhrase = dangerPhrase.trim().toUpperCase() === "ELIMINAR TODO";
  const hasValidEmail =
    expectedEmail.length > 0 &&
    dangerEmail.trim().toLowerCase() === expectedEmail;
  const canPurgeData =
    Boolean(user?.id) &&
    hasValidPhrase &&
    hasValidEmail &&
    dangerAcknowledge &&
    !isPurgingData;

  const handleSaveProfile = async () => {
    try {
      await user?.update({
        firstName,
        lastName,
        username,
      });
      sileo.success({
        title: "Perfil actualizado",
        description: "Tus datos fueron guardados correctamente.",
      });
    } catch {
      sileo.error({
        title: "Error al guardar",
        description: "No se pudieron actualizar los datos. Intenta de nuevo.",
      });
    }
  };

  const handleSavePreferences = () => {
    sileo.success({
      title: "Preferencias guardadas",
      description: "Tu configuración fue actualizada.",
    });
  };

  const handlePurgeData = async () => {
    if (!user?.id) {
      sileo.error({
        title: "Sesión inválida",
        description: "No se pudo validar tu usuario. Volvé a iniciar sesión.",
      });
      return;
    }

    if (!canPurgeData) {
      sileo.error({
        title: "Validación incompleta",
        description:
          'Completá frase, email y confirmación para habilitar "Borrar datos".',
      });
      return;
    }

    setIsPurgingData(true);
    const result = await apiClient.purgeUserData({
      clerkUserId: user.id,
      email: dangerEmail.trim().toLowerCase(),
      confirmation: dangerPhrase.trim().toUpperCase(),
    });
    setIsPurgingData(false);

    if (!result.success || !result.data) {
      sileo.error({
        title: "No se pudo borrar",
        description:
          result.error ??
          "Ocurrió un error al eliminar tus datos. Intentá nuevamente.",
      });
      return;
    }

    sileo.success({
      title: "Datos eliminados",
      description: `Se eliminaron ${result.data.jobsDeleted} ejecuciones y sus datos asociados.`,
    });

    setDangerPhrase("");
    setDangerEmail("");
    setDangerAcknowledge(false);
  };

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Configuración"
        description="Administra tu perfil y preferencias."
      />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-6">
        {/* ── Profile Section ─────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Información personal
            </h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Datos asociados a tu cuenta de Social Crawlee.
            </p>
          </div>

          <div className="glass-card flex flex-col gap-5 rounded-xl p-5">
            {/* Email (read only, managed by Clerk) */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-1.5 text-[13px] text-foreground">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Correo electrónico
              </Label>
              <Input
                value={user?.primaryEmailAddress?.emailAddress || ""}
                disabled
                className="bg-secondary/30 text-sm opacity-60"
              />
              <p className="text-[11px] text-muted-foreground/60">
                El email se administra desde tu proveedor de autenticación.
              </p>
            </div>

            {/* First name */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-1.5 text-[13px] text-foreground">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Nombre
                </Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-secondary/40 text-sm"
                  placeholder="Tu nombre"
                />
              </div>

              {/* Last name */}
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-1.5 text-[13px] text-foreground">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Apellido
                </Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-secondary/40 text-sm"
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-1.5 text-[13px] text-foreground">
                <AtSign className="h-3.5 w-3.5 text-muted-foreground" />
                Nombre de usuario
              </Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-secondary/40 text-sm"
                placeholder="tu_usuario"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} size="sm" className="gap-1.5">
                <Save className="h-3.5 w-3.5" />
                Guardar perfil
              </Button>
            </div>
          </div>
        </section>

        <Separator className="bg-border/30" />

        {/* ── Account Info (read only) ────────────────────── */}
        <section className="flex flex-col gap-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Cuenta</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Información de tu cuenta y estado.
            </p>
          </div>

          <div className="glass-card flex flex-col gap-4 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-[13px] text-foreground">Estado</span>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[12px] font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                Activo
              </span>
            </div>

            <Separator className="bg-border/30" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-[13px] text-foreground">
                  Miembro desde
                </span>
              </div>
              <span className="text-[13px] text-muted-foreground">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        </section>

        <Separator className="bg-border/30" />

        {/* ── Preferences ─────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Preferencias
            </h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Personaliza tu experiencia en el panel.
            </p>
          </div>

          <div className="glass-card flex flex-col gap-4 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Label className="text-[13px] text-foreground">
                  Notificaciones
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Mostrar notificaciones para actualizaciones de ejecuciones.
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <Separator className="bg-border/30" />

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Label className="text-[13px] text-foreground">
                  Auto refresco
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Refrescar automáticamente los estados de ejecuciones.
                </p>
              </div>
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            </div>

            <div className="flex justify-end pt-1">
              <Button
                onClick={handleSavePreferences}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                Guardar preferencias
              </Button>
            </div>
          </div>
        </section>

        <Separator className="bg-border/30" />

        {/* ── Danger Zone ─────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <div>
            <h3 className="text-sm font-semibold text-red-500">
              Zona de peligro
            </h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Acciones irreversibles.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-red-500/20 bg-card/80 p-5">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-[12px] text-red-500/90">
                  Esta acción elimina en forma irreversible tus ejecuciones,
                  datasets y archivos locales asociados.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[12px] text-foreground">
                Escribí <span className="font-semibold">ELIMINAR TODO</span> para
                continuar
              </Label>
              <Input
                value={dangerPhrase}
                onChange={(event) => setDangerPhrase(event.target.value)}
                placeholder="ELIMINAR TODO"
                className="bg-secondary/30 text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[12px] text-foreground">
                Confirmá tu email para validar identidad
              </Label>
              <Input
                value={dangerEmail}
                onChange={(event) => setDangerEmail(event.target.value)}
                placeholder={expectedEmail || "tu@email.com"}
                className="bg-secondary/30 text-sm"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 px-3 py-2">
              <div className="pr-3">
                <p className="text-[12px] text-foreground">
                  Entiendo que esta acción no se puede deshacer.
                </p>
              </div>
              <Switch
                checked={dangerAcknowledge}
                onCheckedChange={setDangerAcknowledge}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ redirectUrl: "/" })}
                disabled={isPurgingData}
              >
                Cerrar sesión
              </Button>
              <Button
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/40"
                onClick={handlePurgeData}
                disabled={!canPurgeData}
              >
                {isPurgingData ? "Borrando..." : "Borrar datos"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
