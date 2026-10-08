import { useEffect, useState, type SubmitEvent } from "react"
import { Pencil, PlusCircle, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "#components/ui/badge"
import { Button } from "#components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "#components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#components/ui/dialog"
import { Input } from "#components/ui/input"
import { Label } from "#components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table"
import { Sidebar } from "../components/sidebar"
import { getRoles } from "../api/roles"
import { createUser, deleteUser, getUsers, updateUser } from "../api/users"
import type { PageMetadata, RoleSummary, UserSummary } from "../types/auth"

interface UserFormState {
  username: string
  password: string
  email: string
  id_role: string
  is_active: boolean | string
}

const EMPTY_FORM: UserFormState = {
  username: "",
  password: "",
  email: "",
  id_role: "",
  is_active: "",
}

const PAGE_SIZE = 10

export function UsersPage() {
  const [users, setUsers] = useState<UserSummary[]>([])
  const [roles, setRoles] = useState<RoleSummary[]>([])
  const [page, setPage] = useState(1)
  const [paging, setPaging] = useState<PageMetadata | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [sortField, setSortField] = useState<"created_at" | "username" | "email">("created_at")
  const [sortBy, setSortBy] = useState<"ASC" | "DESC">("DESC")
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const refreshUsers = async (
    nextPage = page,
    nextSearch = searchText,
    nextSortField = sortField,
    nextSortBy = sortBy,
    nextPageSize = pageSize,
  ) => {
    setLoading(true)

    try {
      const [userPage, roleList] = await Promise.all([
        getUsers({
          page: nextPage,
          size: nextPageSize,
          search: nextSearch,
          sort_field: nextSortField,
          sort_by: nextSortBy,
        }),
        getRoles(),
      ])

      setUsers(userPage.data)
      setPaging(userPage.paging)
      setRoles(roleList)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshUsers(1, "")
  }, [])

  const roleNameMap = Object.fromEntries(roles.map((role) => [role.id, role.name]))
  const filteredUsers = roleFilter
    ? users.filter((user) => user.id_role === roleFilter)
    : users

  const handleSearch = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(1)
    setSearchText(searchInput)
    await refreshUsers(1, searchInput, sortField, sortBy, pageSize)
  }

  const handleSortChange = async (
    nextSortField: "created_at" | "username" | "email",
    nextSortBy: "ASC" | "DESC",
  ) => {
    setSortField(nextSortField)
    setSortBy(nextSortBy)
    setPage(1)
    await refreshUsers(1, searchText, nextSortField, nextSortBy, pageSize)
  }

  const handlePageSizeChange = async (nextPageSize: number) => {
    setPageSize(nextPageSize)
    setPage(1)
    await refreshUsers(1, searchText, sortField, sortBy, nextPageSize)
  }

  const handlePageChange = async (nextPage: number) => {
    setPage(nextPage)
    await refreshUsers(nextPage, searchText, sortField, sortBy, pageSize)
  }

  const handleOpenCreateModal = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleEdit = (user: UserSummary) => {
    setEditingId(user.id)
    setForm({
      username: user.username,
      password: "",
      email: user.email,
      id_role: user.id_role,
      is_active: user.is_active,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      return
    }

    try {
      await deleteUser(id)
      toast.success("User berhasil dihapus")
      await refreshUsers(page, searchText)
    } catch (error) {
      toast.error("Gagal menghapus user")
      console.error(error)
    }
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      if (editingId) {
        await updateUser(editingId, {
          username: form.username,
          email: form.email,
          id_role: form.id_role,
          is_active: form.is_active === true || form.is_active === "true",
        })
        toast.success("User berhasil diperbarui")
      } else {
        await createUser(form)
        toast.success("User berhasil dibuat")
      }

      handleCloseModal()
      await refreshUsers(page, searchText)
    } catch (error) {
      toast.error("Gagal menyimpan user")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground bg-muted">
      <Sidebar active="users" />

      <section className="flex-1 p-4 md:p-8 overflow-hidden">
        <Card className="w-full">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
            <div>
              <CardTitle className="text-xl font-bold">List User OpenVPN</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Kelola akun pengguna, role, dan status akses internal.
              </p>
            </div>
            <Button onClick={handleOpenCreateModal} className="shrink-0">
              <PlusCircle className="mr-2 size-4" />
              Tambah User
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Toolbar: Search and Filter options */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Cari username atau email..."
                    className="pl-9 h-9"
                  />
                </div>
              </form>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={sortField}
                  onChange={(event) =>
                    void handleSortChange(
                      event.target.value as "created_at" | "username" | "email",
                      sortBy,
                    )
                  }
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="created_at">Urutkan: Terbaru</option>
                  <option value="username">Urutkan: Username</option>
                  <option value="email">Urutkan: Email</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    void handleSortChange(sortField, event.target.value as "ASC" | "DESC")
                  }
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="DESC">Descending</option>
                  <option value="ASC">Ascending</option>
                </select>

                <select
                  value={pageSize}
                  onChange={(event) => void handlePageSizeChange(Number(event.target.value))}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value={5}>5 / halaman</option>
                  <option value={10}>10 / halaman</option>
                  <option value={20}>20 / halaman</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  className="flex h-9 min-w-36 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Semua role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Horizontal Scroll Table Container */}
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Memuat data user...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Data user tidak ditemukan.
              </div>
            ) : (
              <>
                <div className="w-full overflow-x-auto rounded-lg border border-border">
                  <Table className="min-w-[680px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[140px] whitespace-nowrap">Username</TableHead>
                        <TableHead className="min-w-[200px] whitespace-nowrap">Email</TableHead>
                        <TableHead className="min-w-[130px] whitespace-nowrap">Role</TableHead>
                        <TableHead className="min-w-[120px] whitespace-nowrap">Active</TableHead>
                        <TableHead className="min-w-[90px] whitespace-nowrap text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {user.username}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="secondary">
                              {roleNameMap[user.id_role] ?? user.id_role}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant={user.is_active ? "success" : "danger"}>
                              {user.is_active ? "Aktif" : "Tidak Aktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(user)}
                                title="Edit User"
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(user.id)}
                                title="Hapus User"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {paging && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Halaman {paging.page} dari {paging.total_page} · Total {paging.total_item} user
                    </p>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={paging.page <= 1}
                        onClick={() => void handlePageChange(page - 1)}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={paging.page >= paging.total_page}
                        onClick={() => void handlePageChange(page + 1)}
                      >
                        Berikutnya
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Modal Form Tambah / Edit User */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Pengguna" : "Tambah Pengguna Baru"}</DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Perbarui informasi akun, role, dan status akses pengguna."
                  : "Lengkapi data berikut untuk menambahkan akun pengguna baru."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="modal-username">Username</Label>
                <Input
                  id="modal-username"
                  value={form.username}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, username: event.target.value }))
                  }
                  placeholder="Masukkan username"
                  required
                  disabled={submitting}
                />
              </div>

              {!editingId && (
                <div className="space-y-2">
                  <Label htmlFor="modal-password">Password</Label>
                  <Input
                    id="modal-password"
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, password: event.target.value }))
                    }
                    placeholder="••••••••"
                    required
                    disabled={submitting}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="modal-email">Email</Label>
                <Input
                  id="modal-email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="nama@perusahaan.com"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-role">Role</Label>
                <select
                  id="modal-role"
                  value={form.id_role}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, id_role: event.target.value }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                  disabled={submitting}
                >
                  <option value="">Pilih role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {editingId && (
                <div className="space-y-2">
                  <Label htmlFor="modal-status">Status Akun</Label>
                  <select
                    id="modal-status"
                    value={String(form.is_active)}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, is_active: event.target.value }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                    disabled={submitting}
                  >
                    <option value="">Pilih status</option>
                    <option value="true">Aktif</option>
                    <option value="false">Tidak Aktif</option>
                  </select>
                </div>
              )}

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Tambah User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>
    </main>
  )
}
