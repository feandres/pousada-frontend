import * as React from "react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
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
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
} from "../utils/api";
import { toast } from "sonner";
import {
  Search,
  PlusCircle,
  Pencil,
  Trash2,
  Loader2,
  CalendarDays,
  Filter,
} from "lucide-react";
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
interface Room {
  id: number;
  name: string;
  number: string;
  description: string;
  capacity: number;
  status: "AVAILABLE" | "CLEANING" | "REPAIRS_NEEDED";
  notes?: string;
}

interface FormState {
  name: string;
  number: string;
  description: string;
  capacity: number;
  status: "AVAILABLE" | "CLEANING" | "REPAIRS_NEEDED";
  notes: string;
}

interface RoomFormProps {
  onSubmit: (e: React.FormEvent) => void;
  buttonText: string;
}

interface AvailabilityFilter {
  checkIn: Date | null;
  checkOut: Date | null;
}

export const Rooms: React.FC = () => {
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openFilter, setOpenFilter] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    number: "",
    description: "",
    capacity: 1,
    status: "AVAILABLE",
    notes: "",
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL"); // Changed default to 'ALL'
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>({
      checkIn: null,
      checkOut: null,
    });
  const [isFilteringAvailability, setIsFilteringAvailability] =
    useState<boolean>(false);
  const queryClient = useQueryClient();

  // Queries
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms", statusFilter],
    queryFn: () =>
      statusFilter && statusFilter !== "ALL"
        ? getRooms({ status: statusFilter })
        : getRooms(),
  });

  const { data: availableRooms, isLoading: isLoadingAvailable } = useQuery({
    queryKey: ["availableRooms", availabilityFilter],
    queryFn: () =>
      availabilityFilter.checkIn && availabilityFilter.checkOut
        ? getAvailableRooms(availabilityFilter)
        : Promise.resolve([]),
    enabled:
      isFilteringAvailability &&
      !!availabilityFilter.checkIn &&
      !!availabilityFilter.checkOut,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setOpenCreate(false);
      resetForm();
      toast.success("Quarto criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(
        `Falha ao criar quarto: ${error.message || "Erro desconhecido"}`
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setOpenEdit(false);
      resetForm();
      setSelectedRoom(null);
      toast.success("Quarto atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(
        `Falha ao atualizar quarto: ${error.message || "Erro desconhecido"}`
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setOpenDelete(false);
      setSelectedRoom(null);
      toast.success("Quarto excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(
        `Falha ao excluir quarto: ${error.message || "Erro desconhecido"}`
      );
    },
  });

  // Funções auxiliares
  const resetForm = () => {
    setForm({
      name: "",
      number: "",
      description: "",
      capacity: 1,
      status: "AVAILABLE",
      notes: "",
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoom) {
      updateMutation.mutate({
        id: selectedRoom.id,
        ...form,
      });
    }
  };

  const handleDeleteSubmit = () => {
    if (selectedRoom) {
      deleteMutation.mutate(selectedRoom.id);
    }
  };

  const openEditDialog = (room: Room) => {
    setSelectedRoom(room);
    setForm({
      name: room.name,
      number: room.number,
      description: room.description,
      capacity: room.capacity,
      status: room.status,
      notes: room.notes || "",
    });
    setOpenEdit(true);
  };

  const openDeleteDialog = (room: Room) => {
    setSelectedRoom(room);
    setOpenDelete(true);
  };

  const applyAvailabilityFilter = () => {
    if (availabilityFilter.checkIn && availabilityFilter.checkOut) {
      setIsFilteringAvailability(true);
      setOpenFilter(false);
      setStatusFilter("ALL"); // Reset status filter when applying availability filter
    } else {
      toast.error(
        "Por favor, selecione datas válidas para check-in e check-out"
      );
    }
  };

  const clearFilters = () => {
    setStatusFilter("ALL"); // Changed to 'ALL'
    setAvailabilityFilter({ checkIn: null, checkOut: null });
    setIsFilteringAvailability(false);
  };

  // Determinar quais dados exibir
  const displayRooms = isFilteringAvailability ? availableRooms : rooms;

  const filteredRooms = displayRooms?.filter(
    (room: Room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge className="bg-green-500">Disponível</Badge>;
      case "CLEANING":
        return <Badge className="bg-blue-500">Limpeza</Badge>;
      case "REPAIRS_NEEDED":
        return <Badge className="bg-orange-500">Manutenção</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Componente do formulário
  const RoomForm: React.FC<RoomFormProps> = ({ onSubmit, buttonText }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={form.name}
          placeholder="Digite o nome do quarto"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, name: e.target.value })
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="number">Número</Label>
        <Input
          id="number"
          value={form.number}
          placeholder="Digite o número do quarto (ex: 101, A-12)"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, number: e.target.value })
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={form.description}
          placeholder="Descreva o quarto"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setForm({ ...form, description: e.target.value })
          }
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacidade</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={form.capacity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, capacity: parseInt(e.target.value) })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.status}
            onValueChange={(
              value: "AVAILABLE" | "CLEANING" | "REPAIRS_NEEDED"
            ) => setForm({ ...form, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AVAILABLE">Disponível</SelectItem>
              <SelectItem value="CLEANING">Limpeza</SelectItem>
              <SelectItem value="REPAIRS_NEEDED">Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={form.notes}
          placeholder="Observações adicionais (opcional)"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setForm({ ...form, notes: e.target.value })
          }
        />
      </div>
      <DialogFooter className="mt-4">
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {(createMutation.isPending || updateMutation.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {buttonText}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          Gerenciamento de Quartos
        </h1>
        <div className="flex gap-2">
          <Dialog open={openFilter} onOpenChange={setOpenFilter}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {(statusFilter !== "ALL" || isFilteringAvailability) && (
                  <Badge className="ml-2 bg-blue-500">Ativo</Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md overflow-auto">
              {" "}
              {/* Added max-w-md and overflow-auto */}
              <DialogHeader>
                <DialogTitle className="text-xl">Filtrar Quartos</DialogTitle>
                <DialogDescription id="filter-room-description">
                  Selecione os filtros para buscar quartos.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                    disabled={isFilteringAvailability}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      <SelectItem value="AVAILABLE">Disponível</SelectItem>
                      <SelectItem value="CLEANING">Limpeza</SelectItem>
                      <SelectItem value="REPAIRS_NEEDED">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">Disponibilidade</Label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {" "}
                    {/* Adjusted grid for responsiveness */}
                    <div className="space-y-1">
                      <Label className="text-xs">Check-in</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal", // Changed w-[280px] to w-full
                              !availabilityFilter.checkIn &&
                                "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {availabilityFilter.checkIn ? (
                              format(availabilityFilter.checkIn, "PPP")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={availabilityFilter.checkIn || undefined}
                            onSelect={(date) =>
                              setAvailabilityFilter((prev) => ({
                                ...prev,
                                checkIn: date || null,
                              }))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Check-out</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal", // Changed w-[280px] to w-full
                              !availabilityFilter.checkOut &&
                                "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {availabilityFilter.checkOut ? (
                              format(availabilityFilter.checkOut, "PPP")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={availabilityFilter.checkOut || undefined}
                            onSelect={(date) =>
                              setAvailabilityFilter((prev) => ({
                                ...prev,
                                checkOut: date || null,
                              }))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar
                  </Button>
                  <Button
                    onClick={applyAvailabilityFilter}
                    disabled={
                      !availabilityFilter.checkIn ||
                      !availabilityFilter.checkOut ||
                      statusFilter !== "ALL"
                    }
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Quarto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl">Criar Novo Quarto</DialogTitle>
                <DialogDescription id="create-room-description">
                  Preencha os detalhes abaixo para criar um novo quarto.
                </DialogDescription>
              </DialogHeader>
              <RoomForm onSubmit={handleCreateSubmit} buttonText="Criar" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar quartos por nome, número ou descrição..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          className="pl-10"
        />
      </div>

      {isFilteringAvailability && (
        <div className="flex items-center bg-blue-50 p-3 rounded-md border border-blue-200">
          <CalendarDays className="h-5 w-5 text-blue-500 mr-2" />
          <div className="flex-1">
            <span className="font-medium">Filtrando por disponibilidade: </span>
            <span>
              {availabilityFilter.checkIn?.toLocaleDateString()} até{" "}
              {availabilityFilter.checkOut?.toLocaleDateString()}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500"
          >
            Limpar
          </Button>
        </div>
      )}

      <div className="bg-white rounded-lg border shadow-sm">
        {isLoading || (isFilteringAvailability && isLoadingAvailable) ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando quartos...</span>
          </div>
        ) : filteredRooms?.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm
              ? "Nenhum quarto encontrado para essa busca."
              : isFilteringAvailability
              ? "Nenhum quarto disponível para as datas selecionadas."
              : "Nenhum quarto cadastrado."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quarto</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms?.map((room: Room) => (
                  <TableRow key={room.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div>{room.name}</div>
                      <div className="text-xs text-gray-500">
                        {room.description}
                      </div>
                    </TableCell>
                    <TableCell>{room.number}</TableCell>
                    <TableCell>
                      {room.capacity} {room.capacity > 1 ? "pessoas" : "pessoa"}
                    </TableCell>
                    <TableCell>{getStatusBadge(room.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 mr-1"
                        onClick={() => openEditDialog(room)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => openDeleteDialog(room)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Quarto</DialogTitle>
            <DialogDescription id="edit-room-description">
              Atualize os detalhes do quarto abaixo.
            </DialogDescription>
          </DialogHeader>
          <RoomForm onSubmit={handleEditSubmit} buttonText="Atualizar" />
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600">
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription id="delete-room-description">
              Confirme a exclusão do quarto abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja excluir o quarto{" "}
              <strong>
                {selectedRoom?.name} ({selectedRoom?.number})
              </strong>
              ?
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Esta ação não poderá ser desfeita. Quartos com reservações ativas
              não podem ser excluídos.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rooms;
