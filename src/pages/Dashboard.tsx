import { DataTable } from "@/components/data-table";

import data from "../mock-data/data.json";
import { useEffect } from "react";
import {
  getTotalGuests,
  getTotalReservations,
  getTotalNewGuests,
  getTotalReservedRooms,
} from "@/utils/api";



function Dashboard() {
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
  
        await getTotalGuests(year, month);
        await getTotalReservations(year, month);
        await getTotalNewGuests(year, month);
        await getTotalReservedRooms(year, month);

      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };
  
    fetchMetrics();
  }, []);
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
