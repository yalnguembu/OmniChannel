import { DetailCard } from "./DetailCard";

/** "Statistiques" tab — placeholder panels until stats endpoints exist. */
export function StatsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-3.5">
      <DetailCard
        title="Volume global"
        bodyClassName="p-4.5 flex flex-col justify-center h-[200px] text-center text-[#8BAFC0] text-[12.5px]"
      >
        Aucune donnée
      </DetailCard>
      <DetailCard
        title="Historique récent"
        bodyClassName="p-4.5 flex flex-col justify-center h-[200px] text-center text-[#8BAFC0] text-[12.5px]"
      >
        Aucune donnée
      </DetailCard>
    </div>
  );
}
