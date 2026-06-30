import { useState } from "react";
import { Plus, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/feedback/PageLoader";
import { ListFilterBar } from "@/components/features/shared/ListFilterBar";
import { useProductEvents } from "@/hooks/useProductEvents";
import { EventDefinitionCard } from "@/components/features/events/EventDefinitionCard";

interface EventsTabProps {
  productId: string;
}

export function EventsTab({ productId }: EventsTabProps) {
  const vm = useProductEvents(productId);
  const f = vm.filters;

  const [creating, setCreating] = useState(false);

  const handleCreate = () => {
    setCreating(true);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-[#E5E7EB] overflow-hidden">
        <ListFilterBar
          search={f.search}
          onSearchChange={f.setSearch}
          searchPlaceholder="Rechercher un événement…"
          dateRange={f.dateRange}
          onDateRangeChange={f.setDateRange}
          advancedFields={vm.filterFields}
          advancedValues={f.advanced}
          advancedDefaults={f.advancedDefaults}
          onApplyAdvanced={f.applyAdvanced}
          isFilterModalOpen={f.isFilterModalOpen}
          setIsFilterModalOpen={f.setIsFilterModalOpen}
          actions={[
            {
              label: "Nouvel événement",
              icon: <Plus size={13} strokeWidth={2.5} />,
              onClick: handleCreate,
            },
          ]}
        />
      </div>

      {vm.isLoading ? (
        <div className="py-20">
          <PageLoader />
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden p-5 space-y-4">
          {vm.events.length === 0 && !creating ? (
            <div className="py-20 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F7F8F9] flex items-center justify-center mb-6">
                <Activity size={32} className="text-[#B8CDD8] opacity-50" />
              </div>
              <h3 className="text-[17px] font-bold text-[#0D2137]">
                Aucun événement
              </h3>
              <p className="text-[13.5px] text-[#8BAFC0] mt-2 mb-8 max-w-85">
                Créez une définition d'événement pour déclencher des actions
                automatisées.
              </p>
              <Button variant="primary" size="sm" onClick={handleCreate}>
                <Plus size={14} className="mr-2" /> Créer maintenant
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {creating && (
                <EventDefinitionCard
                  productId={productId}
                  isNew={true}
                  metadata={vm.metadata}
                  onCancel={() => setCreating(false)}
                  onSaveEvent={vm.createEvent}
                  onValidateMatchRule={vm.validateMatchRule}
                  onValidateCondition={vm.validateCondition}
                  onSaved={() => {
                    setCreating(false);
                    vm.refetch();
                  }}
                />
              )}
              {vm.events.map((event) => (
                <EventDefinitionCard
                  key={event.id}
                  productId={productId}
                  event={event}
                  metadata={vm.metadata}
                  onSaveEvent={vm.updateEvent}
                  onDeleteEvent={() => vm.deleteEvent({ path: { id: event.id! } })}
                  onValidateMatchRule={vm.validateMatchRule}
                  onValidateCondition={vm.validateCondition}
                  onSaved={() => vm.refetch()}
                  onDeleted={() => vm.refetch()}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
