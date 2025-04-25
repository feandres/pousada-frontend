export interface User {
    id: number;
    name: string;
    username: string;
  }
  
  export interface Room {
    id: number;
    name: string;
    number: string;
    description: string;
    capacity: number;
    status: 'AVAILABLE' | 'CLEANING' | 'REPAIRS_NEEDED';
    notes?: string;
  }
  
  export interface Guest {
    id: number;
    name: string;
    cpf: string;
    contactPhone: string;
    supportContact?: string;
  }
  
  export interface Reservation {
    id: number;
    roomId: number;
    room: Room;
    numGuests: number;
    checkIn: string;
    checkOut: string;
    status: 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT';
    guests: ReservationGuest[];
  }
  
  export interface ReservationGuest {
    id: number;
    reservationId: number;
    guestId?: number;
    guest?: Guest;
    name?: string;
    cpf?: string;
    contactPhone?: string;
    supportContact?: string;
  }
  
  export interface OccupancyReport {
    period: { startDate: string; endDate: string };
    occupancy: { room: string; occupancyRate: string }[];
  }
  
  export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
  }

  export interface TotalGuestsResponse {
    totalGuests: number;
    previousMonthTotal: number;
    difference: number;
  }

  export interface TotalReservationsResponse {
    totalReservations: number;
  }
  
  export interface TotalNewGuestsResponse {
    totalNewGuests: number;
  }
  
  export interface TotalReservedRoomsResponse {
    totalReservedRooms: number;
  }
  
  export interface HistoricalMetricData {
    date: string; // YYYY-MM-DD or YYYY-MM
    [key: string]: number | string; // e.g., totalGuests, totalReservations
  }
  
  export interface HistoricalMetricsResponse {
    data: HistoricalMetricData[];
  }