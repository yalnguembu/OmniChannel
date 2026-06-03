import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Shield, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserProfileService } from "@/shared/api/services";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { PageLoader } from "@/components/feedback/PageLoader";
import { cn } from "@/lib/utils";
import type { UserProfileDto } from "@/shared/api/types";
import { SettingsSidebar } from "@/components/features/settings/SettingsSidebar";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  permissions: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export function RolesPage() {
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState<UserProfileDto | null>(null);
  const [isActive, setIsActive] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["user-profiles"],
    queryFn: () => UserProfileService.search({ pageNumber: 1, pageSize: 50 }),
  });
  const profiles: UserProfileDto[] = data?.data?.items ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const saveMut = useMutation({
    mutationFn: (d: Form) => {
      const perms = d.permissions
        ? d.permissions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .join(",")
        : "";
      if (editTarget) {
        // Explicit pick of UpdateUserProfileRequest — no audit / read-only fields
        return UserProfileService.update({
          id: editTarget.id,
          name: d.name,
          description: d.description,
          permissions: perms,
          isActive,
          isSystemProfile: editTarget.isSystemProfile,
        });
      }
      // CreateUserProfileRequest
      return UserProfileService.create({
        name: d.name,
        description: d.description,
        permissions: perms,
        isActive,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profiles"] });
      setModal(false);
      setEditTarget(null);
      toast.success(editTarget ? "Rôle modifié" : "Rôle créé");
    },
    onError: () => toast.error("Erreur"),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => UserProfileService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profiles"] });
      toast.success("Rôle supprimé");
    },
    onError: () => toast.error("Erreur"),
  });

  const openCreate = () => {
    setEditTarget(null);
    reset({ name: "", description: "", permissions: "" });
    setIsActive(true);
    setModal(true);
  };
  const openEdit = (p: UserProfileDto) => {
    setEditTarget(p);
    reset({
      name: p.name,
      description: p.description ?? "",
      permissions: (p.permissions?.split(",") ?? []).join(", "),
    });
    setIsActive(p.isActive);
    setModal(true);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex h-screen bg-white">
      <SettingsSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-7">
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
              Rôles
            </h1>
            <p className="text-[12.5px] text-[#4A7A94] mt-1">
              Définissez les rôles et permissions de votre équipe
            </p>
          </div>

          <div className="flex items-center justify-between mb-5">
        <p className="text-[13px] text-[#4A7A94]">
          {profiles.length} rôle{profiles.length !== 1 ? "s" : ""} configuré
          {profiles.length !== 1 ? "s" : ""}
        </p>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus size={13} />
          Nouveau rôle
        </Button>
      </div>

      <div className="flex flex-col gap-3 max-w-[760px]">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white border border-[#E5E7EB] rounded-[14px]">
            <Shield size={32} className="text-[#8BAFC0] mb-3 opacity-50" />
            <p className="text-[14px] font-medium text-[#0D2137]">
              Aucun rôle configuré
            </p>
            <p className="text-[12.5px] text-[#8BAFC0] mt-1">
              Créez des rôles pour gérer les accès de votre équipe
            </p>
          </div>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() =>
                setExpandedId(expandedId === profile.id ? null : profile.id)
              }
              className={cn(
                "bg-white border rounded-[14px] p-4 cursor-pointer transition-all",
                expandedId === profile.id
                  ? "border-[#2E8FAD] bg-[#E8F4F8] shadow-[0_3px_12px_rgba(13,33,55,0.06)]"
                  : "border-[#E5E7EB] hover:border-[#6AB8D4] hover:shadow-[0_3px_12px_rgba(13,33,55,0.06)]",
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-[14px] font-semibold text-[#0D2137]">
                    {profile.name}
                  </p>
                  {profile.isSystemProfile && (
                    <Badge variant="info">Système</Badge>
                  )}
                  <Badge variant={profile.isActive ? "success" : "neutral"} dot>
                    {profile.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <div
                  className="flex gap-2 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(profile)}
                  >
                    <Edit size={12} />
                    Modifier
                  </Button>
                  {!profile.isSystemProfile && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => deleteMut.mutate(profile.id)}
                      loading={deleteMut.isPending}
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
              </div>

              {profile.description && (
                <p className="text-[12.5px] text-[#4A7A94] mb-3">
                  {profile.description}
                </p>
              )}

              {expandedId === profile.id &&
                (profile.permissions?.split(",") ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[#E5E7EB]">
                    <p className="w-full text-[11px] text-[#8BAFC0] uppercase tracking-[0.06em] mb-1">
                      Permissions
                    </p>
                    {(profile.permissions?.split(",") ?? []).map(
                      (perm: string) => (
                        <code
                          key={perm}
                          className="text-[10.5px] px-2 py-0.5 rounded bg-[#E8F4F8] text-[#2E8FAD] border border-[#C8E8F2] font-mono"
                        >
                          {perm}
                        </code>
                      ),
                    )}
                  </div>
                )}
            </div>
          ))
        )}
      </div>

      <Modal
        open={modal}
        onClose={() => {
          setModal(false);
          setEditTarget(null);
        }}
        title={editTarget ? `Modifier — ${editTarget.name}` : "Nouveau rôle"}
        subtitle={
          editTarget
            ? "Modifiez les permissions de ce rôle"
            : "Configurez les accès pour ce rôle"
        }
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModal(false);
                setEditTarget(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit((d) => saveMut.mutate(d))}
              loading={saveMut.isPending}
            >
              {editTarget ? "Enregistrer" : "Créer le rôle"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nom du rôle *"
            error={errors.name?.message}
            {...register("name")}
            placeholder="ex : Manager, Viewer..."
          />
          <Input
            label="Description"
            {...register("description")}
            placeholder="Décrivez les responsabilités de ce rôle"
          />
          <div>
            <label className="text-[12.5px] font-medium text-[#0D2137] mb-1.5 block">
              Permissions{" "}
              <span className="font-normal text-[#8BAFC0]">
                (séparées par des virgules)
              </span>
            </label>
            <textarea
              {...register("permissions")}
              rows={4}
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-[10px] text-[12px] font-mono outline-none resize-none focus:border-[#2E8FAD] focus:shadow-[0_0_0_3px_rgba(46,143,173,0.1)] text-[#0D2137] placeholder-[#8BAFC0]"
              placeholder="campaigns:read, campaigns:write, contacts:read, contacts:write, messages:read"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                "campaigns:read",
                "campaigns:write",
                "contacts:read",
                "contacts:write",
                "messages:read",
                "billing:read",
                "settings:read",
              ].map((p) => (
                <button
                  key={p}
                  type="button"
                  className="text-[10.5px] px-2 py-0.5 rounded bg-[#F0F2F4] text-[#4A7A94] border border-[#E5E7EB] hover:bg-[#E8F4F8] hover:border-[#C8E8F2] hover:text-[#2E8FAD] transition-all cursor-pointer font-mono"
                  onClick={() => {
                    const cur =
                      (
                        document.querySelector(
                          "textarea[name=permissions]",
                        ) as HTMLTextAreaElement
                      )?.value ?? "";
                    const list = cur
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    if (!list.includes(p)) {
                      const next = [...list, p].join(", ");
                      reset({
                        ...{ name: "", description: "" },
                        permissions: next,
                      });
                    }
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between p-3.5 bg-[#F7F8F9] border border-[#E5E7EB] rounded-[10px]">
            <div>
              <p className="text-[13px] font-medium text-[#0D2137]">
                Rôle actif
              </p>
              <p className="text-[12px] text-[#8BAFC0] mt-0.5">
                Les utilisateurs avec ce rôle peuvent se connecter
              </p>
            </div>
            <Toggle checked={isActive} onChange={setIsActive} />
          </div>
        </div>
      </Modal>
        </div>
      </div>
    </div>
  );
}
