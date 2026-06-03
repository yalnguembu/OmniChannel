import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CompanyChannelService, ChannelService } from "@/shared/api/services";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/feedback/PageLoader";
import { Radio, Settings } from "lucide-react";
import type { ChannelDto } from "@/shared/api/types";
import type { CompanyChannelDto } from "@/shared/api/generated/types.gen";
import { SettingsSidebar } from "@/components/features/settings/SettingsSidebar";

export function SettingsChannelsPage() {
  const qc = useQueryClient();

  const { data: companyChannelsData, isLoading } = useQuery({
    queryKey: ["company-channels"],
    queryFn: () =>
      CompanyChannelService.search({ pageNumber: 1, pageSize: 50 }),
  });

  const { data: allChannelsData } = useQuery({
    queryKey: ["channels", "all"],
    queryFn: () => ChannelService.search({ pageNumber: 1, pageSize: 50 }),
  });

  const companyChannels: CompanyChannelDto[] =
    (companyChannelsData as any)?.data?.items ?? [];
  const allChannels: ChannelDto[] = (allChannelsData as any)?.data?.items ?? [];

  const updateMutation = useMutation({
    mutationFn: (body: Partial<CompanyChannelDto>) =>
      CompanyChannelService.update(body as Partial<CompanyChannelDto>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company-channels"] });
      toast.success("Canal mis à jour");
    },
    onError: () => toast.error("Erreur"),
  });

  if (isLoading) return <PageLoader />;

  // Merge company channel settings with all available channels
  const channelRows = allChannels.map((ch) => {
    const compCh = companyChannels.find((cc) => cc.channelId === ch.id);
    return { channel: ch, companyChannel: compCh };
  });

  return (
    <div className="flex h-screen bg-white">
      <SettingsSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-7">
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
              Canaux actifs
            </h1>
            <p className="text-[12.5px] text-[#4A7A94] mt-1">
              Gérez vos canaux de communication actifs
            </p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden max-w-[760px]">
        <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F7F8F9]">
          <p className="text-[13px] font-medium text-[#0D2137]">
            Canaux de communication
          </p>
          <p className="text-[12px] text-[#8BAFC0] mt-0.5">
            Activez ou désactivez les canaux disponibles pour cette company
          </p>
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {channelRows.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-[13px] text-[#8BAFC0]">
              <Radio size={24} className="mr-3 opacity-30" />
              Aucun canal disponible
            </div>
          ) : (
            channelRows.map(({ channel, companyChannel }) => {
              const isActive = companyChannel?.isActive ?? false;
              return (
                <div
                  key={channel.id}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="w-9 h-9 rounded-[9px] bg-[#E8F4F8] border border-black/5 flex items-center justify-center shrink-0">
                    <Radio size={16} className="text-[#2E8FAD]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#0D2137]">
                      {channel.name}
                    </p>
                    <p className="text-[11.5px] text-[#8BAFC0] mt-0.5">
                      {channel.maxContentLength
                        ? `Max ${channel.maxContentLength} chars · `
                        : ""}
                      {channel.supportsRichContent ? "Rich content · " : ""}
                      {channel.requiresOptIn ? "Opt-in requis" : "Pas d'opt-in"}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings size={12} />
                    Configurer
                  </Button>
                  <Toggle
                    checked={isActive}
                    onChange={(val) => {
                      if (companyChannel) {
                        updateMutation.mutate({
                          ...companyChannel,
                          isActive: val,
                        });
                      }
                    }}
                  />
                </div>
              );
            })
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
