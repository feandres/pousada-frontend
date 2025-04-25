import * as React from "react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReservations,
  createReservation,
  checkInReservation,
  checkOutReservation,
  cancelReservation,
  getRooms,
//   getGuests,
} from "../utils/api";
import { toast } from "sonner";
import { Search, PlusCircle, Loader2, CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Definição dos tipos
interface Reservation {
  id: number;
  roomId: number;
  room: { name: string; capacity: number };
  numGuests: number;
  checkIn: string;
  checkOut: string;
  status: "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT";
  guests: {
    guestId?: number;
    name?: string;
    cpf?: string;
    contactPhone?: string;
    supportContact?: string;
  }[];
}

interface Room {
  id: number;
  name: string;
  capacity: number;
}

// interface Guest {
//   id: number;
//   name: string;
//   cpf: string;
// }

interface FormState {
  roomId: number | null;
  numGuests: number;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: { name: string; cpf: string; contactPhone: string; supportContact?: string }[];
}

interface ReservationFormProps {
  onSubmit: (e: React.FormEvent) => void;
  buttonText: string;
}

interface FilterState {
  startDate: Date | null;
  endDate: Date | null;
}

export const Reservations: React.FC = () => {
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [openAction, setOpenAction] = useState<boolean>(false);
  const [actionType, setActionType] = useState<"checkIn" | "checkOut" | "cancel" | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [form, setForm] = useState<FormState>({
    roomId: null,
    numGuests: 1,
    checkIn: null,
    checkOut: null,
    guests: [{ name: "", cpf: "", contactPhone: "", supportContact: "" }],
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filter, setFilter] = useState<FilterState>({ startDate: null, endDate: null });
  const queryClient = useQueryClient();

  // Queries
  const { data: reservations, isLoading } = useQuery({
    queryKey: ["reservations", filter],
    queryFn: () =>
      getReservations({
        startDate: filter.startDate?.toISOString(),
        endDate: filter.endDate?.toISOString(),
      }),
  });

  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => getRooms(),
  });

//   const { data: guests } = useQuery({
//     queryKey: ["guests"],
//     queryFn: () => getGuests(),
//   });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      setOpenCreate(false);
      resetForm();
      toast.success("Reserva criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Falha ao criar reserva: ${error.message || "Erro desconhecido"}`);
    },
  });

  const checkInMutation = useMutation({
    mutationFn: checkInReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      setOpenAction(false);
      setSelectedReservation(null);
      toast.success("Check-in realizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Falha ao realizar check-in: ${error.message || "Erro desconhecido"}`);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: checkOutReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      setOpenAction(false);
      setSelectedReservation(null);
      toast.success("Check-out realizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Falha ao realizar check-out: ${error.message || "Erro desconhecido"}`);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      setOpenAction(false);
      setSelectedReservation(null);
      toast.success("Reserva cancelada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Falha ao cancelar reserva: ${error.message || "Erro desconhecido"}`);
    },
  });

  // Funções auxiliares
  const resetForm = () => {
    setForm({
      roomId: null,
      numGuests: 1,
      checkIn: null,
      checkOut: null,
      guests: [{ name: "", cpf: "", contactPhone: "", supportContact: "" }],
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.roomId || !form.checkIn || !form.checkOut || form.guests.length !== form.numGuests) {
      toast.error("Por favor, preencha todos os campos obrigatórios e verifique a quantidade de hóspedes.");
      return;
    }
    createMutation.mutate({
      roomId: form.roomId,
      numGuests: form.numGuests,
      checkIn: form.checkIn.toISOString(),
      checkOut: form.checkOut.toISOString(),
      guests: form.guests,
    });
  };

  const handleActionSubmit = () => {
    if (!selectedReservation || !actionType) return;
    switch (actionType) {
      case "checkIn":
        checkInMutation.mutate(selectedReservation.id);
        break;
      case "checkOut":
        checkOutMutation.mutate(selectedReservation.id);
        break;
      case "cancel":
        cancelMutation.mutate(selectedReservation.id);
        break;
    }
  };

  const openActionDialog = (reservation: Reservation, type: "checkIn" | "checkOut" | "cancel") => {
    setSelectedReservation(reservation);
    setActionType(type);
    setOpenAction(true);
  };

  const addGuest = () => {
    setForm({
      ...form,
      guests: [...form.guests, { name: "", cpf: "", contactPhone: "", supportContact: "" }],
    });
  };

  const updateGuest = (index: number, field: keyof FormState["guests"][0], value: string) => {
    const newGuests = [...form.guests];
    newGuests[index][field] = value;
    setForm({ ...form, guests: newGuests });
  };

  const removeGuest = (index: number) => {
    if (form.guests.length > 1) {
      const newGuests = form.guests.filter((_, i) => i !== index);
      setForm({ ...form, guests: newGuests });
    }
  };

  const filteredReservations = reservations?.filter((reservation: Reservation) =>
    reservation.room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.guests.some(guest => guest.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-blue-500">Confirmada</Badge>;
      case "CHECKED_IN":
        return <Badge className="bg-green-500">Check-in</Badge>;
      case "CHECKED_OUT":
        return <Badge className="bg-gray-500">Check-out</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500">Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Componente do formulário
  const ReservationForm: React.FC<ReservationFormProps> = ({ onSubmit, buttonText }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="roomId">Quarto</Label>
        <Select
          value={form.roomId?.toString() || ""}
          onValueChange={(value) => setForm({ ...form, roomId: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um quarto" />
          </SelectTrigger>
          <SelectContent>
            {rooms?.map((room: Room) => (
              <SelectItem key={room.id} value={room.id.toString()}>
                {room.name} (Capacidade: {room.capacity})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="numGuests">Número de Hóspedes</Label>
        <Input
          id="numGuests"
          type="number"
          min="1"
          value={form.numGuests}
          onChange={(e) => setForm({ ...form, numGuests: parseInt(e.target.value) })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Check-in</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !form.checkIn && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.checkIn ? format(form.checkIn, "PPP") : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.checkIn || undefined}
                onSelect={(date) => setForm({ ...form, checkIn: date || null })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Check-out</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !form.checkOut && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.checkOut ? format(form.checkOut, "PPP") : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.checkOut || undefined}
                onSelect={(date) => setForm({ ...form, checkOut: date || null })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Hóspedes</Label>
        {form.guests.map((guest, index) => (
          <div key={index} className="border p-4 rounded-md space-y-2 relative">
            <div className="space-y-2">
              <Label htmlFor={`guest-${index}-name`}>Nome</Label>
              <Input
                id={`guest-${index}-name`}
                value={guest.name}
                onChange={(e) => updateGuest(index, "name", e.target.value)}
                placeholder="Nome do hóspede"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`guest-${index}-cpf`}>CPF</Label>
              <Input
                id={`guest-${index}-cpf`}
                value={guest.cpf}
                onChange={(e) => updateGuest(index, "cpf", e.target.value)}
                placeholder="CPF (11 dígitos)"
                pattern="\d{11}"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`guest-${index}-contactPhone`}>Telefone de Contato</Label>
              <Input
                id={`guest-${index}-contactPhone`}
                value={guest.contactPhone}
                onChange={(e) => updateGuest(index, "contactPhone", e.target.value)}
                placeholder="Telefone (ex: +5511999999999)"
                pattern="\+?\d{10,15}"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`guest-${index}-supportContact`}>Telefone de Suporte (opcional)</Label>
              <Input
                id={`guest-${index}-supportContact`}
                value={guest.supportContact || ""}
                onChange={(e) => updateGuest(index, "supportContact", e.target.value)}
                placeholder="Telefone de suporte"
                pattern="\+?\d{10,15}"
              />
            </div>
            {form.guests.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-red-600"
                onClick={() => removeGuest(index)}
              >
                Remover
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          onClick={addGuest}
          disabled={form.guests.length >= form.numGuests}
        >
          Adicionar Hóspede
        </Button>
      </div>
      <DialogFooter className="mt-4">
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {buttonText}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">Gerenciamento de Reservas</h1>
        <div className="flex gap-2">
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Reserva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Criar Nova Reserva</DialogTitle>
                <DialogDescription id="create-reservation-description">
                  Preencha os detalhes abaixo para criar uma nova reserva.
                </DialogDescription>
              </DialogHeader>
              <ReservationForm onSubmit={handleCreateSubmit} buttonText="Criar" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar reservas por quarto ou nome do hóspede..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {(filter.startDate || filter.endDate) && (
        <div className="flex items-center bg-blue-50 p-3 rounded-md border border-blue-200">
          <CalendarDays className="h-5 w-5 text-blue-500 mr-2" />
          <div className="flex-1">
            <span className="font-medium">Filtrando por período: </span>
            <span>
              {filter.startDate?.toLocaleDateString()} até {filter.endDate?.toLocaleDateString()}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter({ startDate: null, endDate: null })}
            className="text-gray-500"
          >
            Limpar
          </Button>
        </div>
      )}

      <div className="bg-white rounded-lg border shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando reservas...</span>
          </div>
        ) : filteredReservations?.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm ? "Nenhuma reserva encontrada para essa busca." : "Nenhuma reserva cadastrada."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quarto</TableHead>
                  <TableHead>Hóspedes</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations?.map((reservation: Reservation) => (
                  <TableRow key={reservation.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{reservation.room.name}</TableCell>
                    <TableCell>{reservation.numGuests}</TableCell>
                    <TableCell>{format(new Date(reservation.checkIn), "PPP")}</TableCell>
                    <TableCell>{format(new Date(reservation.checkOut), "PPP")}</TableCell>
                    <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                    <TableCell className="text-right">
                      {reservation.status === "CONFIRMED" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 mr-1"
                            onClick={() => openActionDialog(reservation, "checkIn")}
                          >
                            Check-in
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() => openActionDialog(reservation, "cancel")}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {reservation.status === "CHECKED_IN" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => openActionDialog(reservation, "checkOut")}
                        >
                          Check-out
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={openAction} onOpenChange={setOpenAction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-600">
              {actionType === "checkIn" && "Confirmar Check-in"}
              {actionType === "checkOut" && "Confirmar Check-out"}
              {actionType === "cancel" && "Confirmar Cancelamento"}
            </DialogTitle>
            <DialogDescription id="action-reservation-description">
              Confirme a ação para a reserva abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja{" "}
              <strong>
                {actionType === "checkIn" && "realizar o check-in"}
                {actionType === "checkOut" && "realizar o check-out"}
                {actionType === "cancel" && "cancelar"}
              </strong>{" "}
              da reserva para o quarto <strong>{selectedReservation?.room.name}</strong>?
            </p>
            {actionType === "cancel" && (
              <p className="text-gray-500 text-sm mt-2">
                Cancelamentos só são permitidos até 2 dias antes do check-in.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAction(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleActionSubmit}
              disabled={
                checkInMutation.isPending ||
                checkOutMutation.isPending ||
                cancelMutation.isPending
              }
            >
              {(checkInMutation.isPending || checkOutMutation.isPending || cancelMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reservations;