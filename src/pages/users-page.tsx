import { useEffect, useState, type FormEvent } from "react"
import { Pencil, PlusCircle, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "#components/ui/badge"
import { Button } from "#components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "#components/ui/card"
import { Input } from "#components/ui/input"
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

const EMPTY_FORM = {
  username: "",
  password: "",
  email: "",
  id_role: "",
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

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(1)
    setSearchText(searchInput)
    await refreshUsers(1, searchInput, sortField, sortBy, pageSize)
  }

  const handleSortChange = async (nextSortField: "created_at" | "username" | "email", nextSortBy: "ASC" | "DESC") => {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      if (editingId) {
        await updateUser(editingId, {
          username: form.username,
          email: form.email,
          id_role: form.id_role,
        })
        toast.success("User berhasil diperbarui")
      } else {
        await createUser(form)
        toast.success("User berhasil dibuat")
      }

      setForm(EMPTY_FORM)
      setEditingId(null)
      await refreshUsers(page, searchText)
    } catch (error) {
      toast.error("Gagal menyimpan user")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (user: UserSummary) => {
    setEditingId(user.id)
    setForm({
      username: user.username,
      password: "",
      email: user.email,
      id_role: user.id_role,
    })
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id)
      toast.success("User berhasil dihapus")
      await refreshUsers(page, searchText)
    } catch (error) {
      toast.error("Gagal menghapus user")
      console.error(error)
    }
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground bg-muted">
      <Sidebar active="users" />

      <section className="flex-1 p-4 md:p-8">
        <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit User" : "Tambah User"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Username</label>
                  <Input
                    value={form.username}
                    onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                    placeholder="username"
                    required
                  />
                </div>

                {!editingId && (
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">Password</label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="mail@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Role</label>
                  <select
                    value={form.id_role}
                    onChange={(event) => setForm((current) => ({ ...current, id_role: event.target.value }))}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Pilih role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" variant="cyan" disabled={submitting}>
                    <PlusCircle className="mr-2 size-4" />
                    {submitting ? "Menyimpan..." : editingId ? "Update User" : "Tambah User"}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null)
                        setForm(EMPTY_FORM)
                      }}
                    >
                      Batal
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>List User OpenVPN</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Cari username atau email"
                      className="pl-9"
                    />
                  </div>
                </form>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    value={sortField}
                    onChange={(event) => void handleSortChange(event.target.value as "created_at" | "username" | "email", sortBy)}
                    className="flex h-9 min-w-40 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="created_at">Urutkan: Terbaru</option>
                    <option value="username">Urutkan: Username</option>
                    <option value="email">Urutkan: Email</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(event) => void handleSortChange(sortField, event.target.value as "ASC" | "DESC")}
                    className="flex h-9 min-w-40 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="DESC">Descending</option>
                    <option value="ASC">Ascending</option>
                  </select>

                  <select
                    value={pageSize}
                    onChange={(event) => void handlePageSizeChange(Number(event.target.value))}
                    className="flex h-9 min-w-32 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value={5}>5 / halaman</option>
                    <option value={10}>10 / halaman</option>
                    <option value={20}>20 / halaman</option>
                  </select>

                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className="flex h-9 min-w-48 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

              {loading ? (
                <p className="text-sm text-muted-foreground">Memuat data user...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Data user tidak ditemukan.</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{roleNameMap[user.id_role] ?? user.id_role}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                                <Pencil className="size-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {paging && (
                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm text-muted-foreground">
                        Halaman {paging.page} dari {paging.total_page} · Total {paging.total_item} user
                      </p>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={paging.page <= 1}
                          onClick={() => void handlePageChange(page - 1)}
                        >
                          Sebelumnya
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
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
        </div>
      </section>
    </main>
  )
}
