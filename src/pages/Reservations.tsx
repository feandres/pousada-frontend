import { ReservationDataTable } from "@/components/reservation-data-table";
import data from "../mock-data/data.json";

export default function Reservations() {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-3xl font-bold flex items-center">
        Gerenciar de Reservas
      </h1>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <ReservationDataTable data={data} />
        </div>
      </div>
    </div>
  );
}
