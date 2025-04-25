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
import { getUsers, createUser, updateUser, deleteUser } from "../utils/api";
import { toast } from "sonner";
import { Search, PlusCircle, Pencil, Trash2, Loader2 } from "lucide-react";

interface User {
  id: number;
  name: string;
  username: string;
  password?: string;
}

interface FormState {
  name: string;
  username: string;
  password: string;
}

interface UserFormProps {
  onSubmit: (e: React.FormEvent) => void;
  buttonText: string;
}

export const Users: React.FC = () => {
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    username: "",
    password: "",
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpenCreate(false);
      setForm({ name: "", username: "", password: "" });
      toast.success("Usuário criado com sucesso!");
    },
    onError: () => {
      toast.error("Falha ao criar usuário");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpenEdit(false);
      setForm({ name: "", username: "", password: "" });
      setSelectedUser(null);
      toast.success("Usuário atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Falha ao atualizar usuário");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpenDelete(false);
      setSelectedUser(null);
      toast.success("Usuário removido com sucesso!");
    },
    onError: () => {
      toast.error("Falha ao remover usuário");
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      updateMutation.mutate({
        id: selectedUser.id,
        name: form.name,
        username: form.username,
        password: form.password || undefined,
      });
    }
  };

  const handleDeleteSubmit = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setForm({ name: user.name, username: user.username, password: "" });
    setOpenEdit(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setOpenDelete(true);
  };

  const filteredUsers = users?.filter(
    (user: User) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const UserForm: React.FC<UserFormProps> = ({ onSubmit, buttonText }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={form.name}
          placeholder="Digite o nome completo"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, name: e.target.value })
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Nome de usuário</Label>
        <Input
          id="username"
          value={form.username}
          placeholder="Digite o nome de usuário"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, username: e.target.value })
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">
          {buttonText === "Atualizar" ? "Senha (opcional)" : "Senha"}
        </Label>
        <Input
          id="password"
          type="password"
          value={form.password}
          placeholder={
            buttonText === "Atualizar"
              ? "Deixe em branco para manter a atual"
              : "Digite a senha"
          }
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, password: e.target.value })
          }
          required={buttonText !== "Atualizar"}
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
          Gerenciamento de Usuários
        </h1>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl">Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <UserForm onSubmit={handleCreateSubmit} buttonText="Criar" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          className="pl-10"
        />
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando usuários...</span>
          </div>
        ) : filteredUsers?.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {searchTerm
              ? "Nenhum usuário encontrado para essa busca."
              : "Nenhum usuário cadastrado."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Nome</TableHead>
                  <TableHead className="w-1/3">Nome de usuário</TableHead>
                  <TableHead className="w-1/3 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user: User) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 mr-1"
                        onClick={() => openEditDialog(user)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => openDeleteDialog(user)}
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
            <DialogTitle className="text-xl">Editar Usuário</DialogTitle>
          </DialogHeader>
          <UserForm onSubmit={handleEditSubmit} buttonText="Atualizar" />
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600">
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja excluir o usuário{" "}
              <strong>{selectedUser?.name}</strong>?
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Esta ação não poderá ser desfeita.
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

export default Users;
