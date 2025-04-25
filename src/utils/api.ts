import axios, { AxiosError } from "axios";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}
import {
  User,
  Reservation,
  Room,
  Guest,
  OccupancyReport,
  AuthState,
  TotalGuestsResponse,
  TotalReservationsResponse,
  TotalNewGuestsResponse,
  TotalReservedRoomsResponse,
  HistoricalMetricsResponse,
} from "../types";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (
  username: string,
  password: string
): Promise<User> => {
  const response = await api.post("/auth/login", { username, password });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const getAuthStatus = async (): Promise<AuthState> => {
  const response = await api.get("/auth/status");
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

export const createUser = async (data: {
  name: string;
  username: string;
  password: string;
}): Promise<User> => {
  const response = await api.post("/users", data);
  return response.data;
};

export const updateUser = async (data: {
  id: number;
  name?: string;
  username?: string;
  password?: string;
}): Promise<User> => {
  const response = await api.put(`/users/${data.id}`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const createReservation = async (data: {
  roomId: number;
  numGuests: number;
  checkIn: string;
  checkOut: string;
  guests: {
    guestId?: number;
    name?: string;
    cpf?: string;
    contactPhone?: string;
    supportContact?: string;
  }[];
}): Promise<Reservation> => {
  // Validate room capacity and number of guests
  const room = await api.get(`/rooms/${data.roomId}`);
  if (!room) {
    throw new Error("Room not found");
  }
  if (data.numGuests > room.data.capacity) {
    throw new Error("Number of guests exceeds room capacity");
  }
  if (data.guests.length !== data.numGuests) {
    throw new Error("Number of guests provided does not match numGuests");
  }

  // Validate check-in and check-out dates
  if (new Date(data.checkOut) <= new Date(data.checkIn)) {
    throw new Error("Check-out must be after check-in");
  }

  // Ensure no duplicate CPFs in guests
  const cpfs = new Set();
  for (const guest of data.guests) {
    if (guest.cpf && cpfs.has(guest.cpf)) {
      throw new Error(`Duplicate CPF: ${guest.cpf}`);
    }
    cpfs.add(guest.cpf);
  }

  // Create reservation
  const response = await api.post("/reservations", data);
  return response.data;
};

export const getReservations = async (params?: {
  startDate?: string;
  endDate?: string;
  roomId?: number;
  period?: string;
}): Promise<Reservation[]> => {
  const response = await api.get("/reservations", { params });
  return response.data;
};

export const updateReservation = async (
  id: number,
  data: {
    roomId?: number;
    numGuests?: number;
    checkIn?: string;
    checkOut?: string;
    status?: "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT";
    guests?: {
      guestId?: number;
      name?: string;
      cpf?: string;
      contactPhone?: string;
      supportContact?: string;
    }[];
  }
): Promise<Reservation> => {
  // Validate room capacity and number of guests
  if (data.roomId) {
    const room = await api.get(`/rooms/${data.roomId}`);
    if (!room) {
      throw new Error("Room not found");
    }
    if (data.numGuests && data.numGuests > room.data.capacity) {
      throw new Error("Number of guests exceeds room capacity");
    }
  }

  // Validate check-in and check-out dates
  if (data.checkIn && data.checkOut) {
    if (new Date(data.checkOut) <= new Date(data.checkIn)) {
      throw new Error("Check-out must be after check-in");
    }
  }

  // Ensure no duplicate CPFs in guests
  if (data.guests) {
    const cpfs = new Set();
    for (const guest of data.guests) {
      if (guest.cpf && cpfs.has(guest.cpf)) {
        throw new Error(`Duplicate CPF: ${guest.cpf}`);
      }
      cpfs.add(guest.cpf);
    }
  }

  // Update reservation
  const response = await api.put(`/reservations/${id}`, data);
  return response.data;
};

export const getReservationsByStatus = async (
  status: string
): Promise<Reservation[]> => {
  const response = await api.get("/reservations/status", {
    params: { status },
  });
  return response.data;
};

export const checkInReservation = async (id: number): Promise<Reservation> => {
  const response = await api.patch(`/reservations/${id}/check-in`);
  return response.data;
};

export const checkOutReservation = async (id: number): Promise<Reservation> => {
  const response = await api.patch(`/reservations/${id}/check-out`);
  return response.data;
};

export const cancelReservation = async (id: number): Promise<Reservation> => {
  const response = await api.patch(`/reservations/${id}/cancel`);
  return response.data;
};

export const getGuests = async (): Promise<Guest[]> => {
  const response = await api.get("/guests");
  return response.data;
};

export const createGuest = async (data: {
  name: string;
  cpf: string;
  contactPhone: string;
  supportContact?: string;
}): Promise<Guest> => {
  const response = await api.post("/guests", data);
  return response.data;
};

export const getOccupancyReport = async (
  startDate: string,
  endDate: string
): Promise<OccupancyReport> => {
  const response = await api.get("/reports/occupancy", {
    params: { startDate, endDate },
  });
  return response.data;
};

// Funções relacionadas aos quartos
export const getRooms = async (params?: {
  status?: string;
}): Promise<Room[]> => {
  const response = await api.get("/rooms", { params });
  return response.data;
};

export const getRoomsByStatus = async (status: string): Promise<Room[]> => {
  const response = await api.get("/rooms/status", { params: { status } });
  return response.data;
};

export const getAvailableRooms = async (params: {
  checkIn: Date | null;
  checkOut: Date | null;
}): Promise<Room[]> => {
  if (!params.checkIn || !params.checkOut) return [];

  const response = await api.get("/rooms/available", {
    params: {
      checkIn: params.checkIn.toISOString(),
      checkOut: params.checkOut.toISOString(),
    },
  });
  return response.data;
};

export const createRoom = async (data: {
  name: string;
  number: string;
  description: string;
  capacity: number;
  status?: "AVAILABLE" | "CLEANING" | "REPAIRS_NEEDED";
  notes?: string;
}): Promise<Room> => {
  const response = await api.post("/rooms", data);
  return response.data;
};

export const updateRoom = async (data: {
  id: number;
  name?: string;
  number?: string;
  description?: string;
  capacity?: number;
  status?: "AVAILABLE" | "CLEANING" | "REPAIRS_NEEDED";
  notes?: string;
}): Promise<Room> => {
  const { id, ...roomData } = data;
  const response = await api.put(`/rooms/${id}`, roomData);
  return response.data;
};

export const deleteRoom = async (id: number): Promise<void> => {
  await api.delete(`/rooms/${id}`);
};


export const getTotalGuests = async (
  year: number,
  month: number
): Promise<TotalGuestsResponse> => {
  const response = await api.get(`/metrics/total-guests`, {
    params: { year, month },
  });
  return response.data;
};

export const getTotalReservations = async (
  year: number,
  month: number
): Promise<TotalReservationsResponse> => {
  const response = await api.get(`/metrics/total-reservations`, {
    params: { year, month },
  });
  return response.data;
};

export const getTotalNewGuests = async (
  year: number,
  month: number
): Promise<TotalNewGuestsResponse> => {
  try {
    const response = await api.get(`/metrics/total-new-guests`, {
      params: { year, month },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching total new guests:', error);
    throw error;
  }
};

export const getTotalReservedRooms = async (
  year: number,
  month: number
): Promise<TotalReservedRoomsResponse> => {
  const response = await api.get(`/metrics/total-reserved-rooms`, {
    params: { year, month },
  });
  return response.data;
};

export const getHistoricalMetrics = async (
  metric: string,
  year: number,
  quarter?: number,
  month?: number,
  granularity: "daily" | "monthly" = "monthly"
): Promise<HistoricalMetricsResponse> => {
  const response = await api.get(`/metrics/historical`, {
    params: { metric, year, quarter, month, granularity },
  });
  return response.data;
};

export default api;
