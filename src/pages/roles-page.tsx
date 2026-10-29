import { useEffect, useState, type FormEvent } from "react"
import { Check, CheckSquare, Pencil, PlusCircle, RotateCcw, Search, Shield, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "#components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "#components/ui/card"
import { Input } from "#components/ui/input"
import { Badge } from "#components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table"
import { Sidebar } from "../components/sidebar"
import { Can } from "../components/can"
import { createRole, deleteRole, getRoleById, getRolePage, updateRole } from "../api/roles"
import { getPermissionList } from "../api/permissions"
import type { PageMetadata, ResourcePermissions, RoleSummary } from "../types/auth"

const PAGE_SIZE = 10

// Helper nama modul yang lebih ramah pengguna
const RESOURCE_LABELS: Record<string, string> = {
  vpn_servers: "VPN Server Management",
  vpn_clients: "VPN Client Management",
  users: "User Management",
  roles: "Role & Permission Management",
}

export function RolesPage() {
  const [roles, setRoles] = useState<RoleSummary[]>([])
  const [permissionGroups, setPermissionGroups] = useState<ResourcePermissions[]>([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set())

  const [page, setPage] = useState(1)
  const [paging, setPaging] = useState<PageMetadata | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [sortField, setSortField] = useState<"created_at" | "name">("created_at")
  const [sortBy, setSortBy] = useState<"ASC" | "DESC">("DESC")
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isEditingSuperadmin, setIsEditingSuperadmin] = useState(false)

  const refreshRoles = async (
    nextPage = page,
    nextSearch = searchText,
    nextSortField = sortField,
    nextSortBy = sortBy,
    nextPageSize = pageSize,
  ) => {
    setLoading(true)

    try {
      const result = await getRolePage({
        page: nextPage,
        size: nextPageSize,
        search: nextSearch,
        sort_field: nextSortField,
        sort_by: nextSortBy,
      })

      setRoles(result.data)
      setPaging(result.paging)
    } catch (error) {
      toast.error("Gagal memuat daftar role")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadPermissions = async () => {
    setLoadingPermissions(true)
    try {
      const perms = await getPermissionList()
      setPermissionGroups(perms)
    } catch (error) {
      toast.error("Gagal memuat daftar hak akses permission")
      console.error(error)
    } finally {
      setLoadingPermissions(false)
    }
  }

  useEffect(() => {
    void refreshRoles(1, "")
    void loadPermissions()
  }, [])

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(1)
    setSearchText(searchInput)
    await refreshRoles(1, searchInput, sortField, sortBy, pageSize)
  }

  const handleSortChange = async (nextSortField: "created_at" | "name", nextSortBy: "ASC" | "DESC") => {
    setSortField(nextSortField)
    setSortBy(nextSortBy)
    setPage(1)
    await refreshRoles(1, searchText, nextSortField, nextSortBy, pageSize)
  }

  const handlePageSizeChange = async (nextPageSize: number) => {
    setPageSize(nextPageSize)
    setPage(1)
    await refreshRoles(1, searchText, sortField, sortBy, nextPageSize)
  }

  const handlePageChange = async (nextPage: number) => {
    setPage(nextPage)
    await refreshRoles(nextPage, searchText, sortField, sortBy, pageSize)
  }

  const togglePermission = (id: string) => {
    if (isEditingSuperadmin) return
    const next = new Set(selectedPermissionIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedPermissionIds(next)
  }

  const toggleGroup = (group: ResourcePermissions) => {
    if (isEditingSuperadmin) return
    const groupPermIds = group.permissions.map((p) => p.id)
    const isAllSelected = groupPermIds.every((id) => selectedPermissionIds.has(id))

    const next = new Set(selectedPermissionIds)
    if (isAllSelected) {
      groupPermIds.forEach((id) => next.delete(id))
    } else {
      groupPermIds.forEach((id) => next.add(id))
    }
    setSelectedPermissionIds(next)
  }

  const handleSelectAll = () => {
    if (isEditingSuperadmin) return
    const allIds = permissionGroups.flatMap((g) => g.permissions.map((p) => p.id))
    setSelectedPermissionIds(new Set(allIds))
  }

  const handleClearAll = () => {
    if (isEditingSuperadmin) return
    setSelectedPermissionIds(new Set())
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setSelectedPermissionIds(new Set())
    setEditingId(null)
    setIsEditingSuperadmin(false)
  }

  const handleEdit = async (role: RoleSummary) => {
    try {
      const isSuperadmin = role.name === "Superadmin"
      setIsEditingSuperadmin(isSuperadmin)
      setEditingId(role.id)
      setName(role.name)
      setDescription(role.description || "")

      // Fetch detail untuk mendapatkan daftar permission yang sudah terhubung
      const detail = await getRoleById(role.id)
      const permIds = new Set((detail.permissions || []).map((p) => p.id))
      setSelectedPermissionIds(permIds)
    } catch (error) {
      toast.error("Gagal memuat detail role")
      console.error(error)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const permission_ids = Array.from(selectedPermissionIds)

      if (editingId) {
        await updateRole(editingId, {
          name,
          description,
          permission_ids,
        })
        toast.success("Role berhasil diperbarui")
      } else {
        await createRole({
          name,
          description,
          permission_ids,
        })
        toast.success("Role berhasil dibuat")
      }

      resetForm()
      await refreshRoles(page, searchText)
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Gagal menyimpan role"
      toast.error(msg)
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, roleName: string) => {
    if (roleName === "Superadmin") {
      toast.error("Role Superadmin tidak dapat dihapus")
      return
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus role "${roleName}"?`)) {
      return
    }

    try {
      await deleteRole(id)
      toast.success("Role berhasil dihapus")
      if (editingId === id) {
        resetForm()
      }
      await refreshRoles(page, searchText)
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Gagal menghapus role"
      toast.error(msg)
      console.error(error)
    }
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground bg-muted">
      <Sidebar active="roles" />

      <section className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mb-6 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Shield className="size-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Role & Hak Akses (RBAC)</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Atur peran pengguna dan petakan izin akses modular untuk Frontend dan Backend.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[450px_1fr]">
          {/* Kolom Form Role & Permission Matrix */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {editingId ? (
                    <span className="flex items-center gap-2">
                      <Pencil className="size-4 text-primary" /> Edit Role
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <PlusCircle className="size-4 text-primary" /> Tambah Role Baru
                    </span>
                  )}
                </CardTitle>
                {editingId && (
                  <Button size="sm" variant="ghost" onClick={resetForm}>
                    <X className="size-4 mr-1" /> Batal
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1 block text-sm font-medium">Nama Role *</label>
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Contoh: Network Operator"
                    required
                    disabled={isEditingSuperadmin}
                  />
                  {isEditingSuperadmin && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Nama role Superadmin tidak dapat diubah (dilindungi oleh sistem).
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Deskripsi</label>
                  <Input
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Contoh: Mengelola client VPN dan download config"
                  />
                </div>

                {/* Hak Akses / Permissions Matrix */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">
                      Hak Akses Permission ({selectedPermissionIds.size} dipilih)
                    </label>
                    {!isEditingSuperadmin && (
                      <div className="flex gap-2 text-xs">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="text-primary hover:underline"
                        >
                          Pilih Semua
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="text-muted-foreground hover:underline"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>

                  {loadingPermissions ? (
                    <p className="text-xs text-muted-foreground py-2">Memuat hak akses...</p>
                  ) : (
                    <div className="max-h-[380px] overflow-y-auto space-y-3 rounded-lg border border-border/60 bg-background/50 p-3">
                      {permissionGroups.map((group) => {
                        const groupPermIds = group.permissions.map((p) => p.id)
                        const allSelected = groupPermIds.every((id) => selectedPermissionIds.has(id))
                        const someSelected =
                          !allSelected && groupPermIds.some((id) => selectedPermissionIds.has(id))

                        return (
                          <div
                            key={group.resource}
                            className="rounded-md border border-border/40 bg-card p-3 shadow-xs"
                          >
                            <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                              <label className="flex items-center gap-2 cursor-pointer font-medium text-xs uppercase tracking-wider text-muted-foreground">
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  ref={(el) => {
                                    if (el) el.indeterminate = someSelected
                                  }}
                                  onChange={() => toggleGroup(group)}
                                  disabled={isEditingSuperadmin}
                                  className="rounded border-input text-primary focus:ring-primary"
                                />
                                {RESOURCE_LABELS[group.resource] || group.resource}
                              </label>
                              <span className="text-[11px] text-muted-foreground">
                                {group.permissions.filter((p) => selectedPermissionIds.has(p.id)).length}/
                                {group.permissions.length}
                              </span>
                            </div>

                            <div className="grid gap-1.5 pl-6">
                              {group.permissions.map((perm) => {
                                const checked = selectedPermissionIds.has(perm.id)
                                return (
                                  <label
                                    key={perm.id}
                                    className={`flex items-start gap-2 text-xs cursor-pointer rounded-sm px-1.5 py-1 transition-colors ${checked ? "bg-primary/10 text-foreground" : "hover:bg-muted text-muted-foreground"
                                      }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => togglePermission(perm.id)}
                                      disabled={isEditingSuperadmin}
                                      className="mt-0.5 rounded border-input text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium text-foreground">{perm.description || perm.code}</p>
                                      <code className="text-[10px] text-muted-foreground">{perm.code}</code>
                                    </div>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Can do={editingId ? "roles:update" : "roles:create"}>
                    <Button type="submit" disabled={submitting} className="flex-1">
                      {editingId ? (
                        <>
                          <Check className="mr-2 size-4" />
                          {submitting ? "Memperbarui..." : "Perbarui Role"}
                        </>
                      ) : (
                        <>
                          <PlusCircle className="mr-2 size-4" />
                          {submitting ? "Menyimpan..." : "Simpan Role"}
                        </>
                      )}
                    </Button>
                  </Can>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      <RotateCcw className="mr-2 size-4" />
                      Reset
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Kolom Tabel Daftar Role */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Daftar Role Terdaftar</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Filter & Toolbar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleSearch} className="flex-1 max-w-sm">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Cari nama role..."
                      className="pl-9"
                    />
                  </div>
                </form>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={sortField}
                    onChange={(event) => void handleSortChange(event.target.value as "created_at" | "name", sortBy)}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="created_at">Terbaru</option>
                    <option value="name">Nama</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(event) => void handleSortChange(sortField, event.target.value as "ASC" | "DESC")}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="DESC">DESC</option>
                    <option value="ASC">ASC</option>
                  </select>

                  <select
                    value={pageSize}
                    onChange={(event) => void handlePageSizeChange(Number(event.target.value))}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value={5}>5 / hal</option>
                    <option value={10}>10 / hal</option>
                    <option value={20}>20 / hal</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Memuat daftar role...</p>
              ) : roles.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Data role tidak ditemukan.</p>
              ) : (
                <>
                  <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Role</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead>Hak Akses</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roles.map((role) => {
                          const isSuperadmin = role.name === "Superadmin"
                          const permCount = role.permissions?.length ?? 0

                          return (
                            <TableRow key={role.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <span>{role.name}</span>
                                  {isSuperadmin && <Badge variant="secondary">System Role</Badge>}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs max-w-xs truncate">
                                {role.description || "-"}
                              </TableCell>
                              <TableCell>
                                {isSuperadmin ? (
                                  <Badge variant="success">Semua Hak Akses (*)</Badge>
                                ) : (
                                  <Badge variant="outline">
                                    <CheckSquare className="mr-1 size-3" />
                                    {permCount} Hak Akses
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1.5">
                                  <Can do="roles:update">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => void handleEdit(role)}
                                      title={isSuperadmin ? "Superadmin dilindungi" : "Edit Role"}
                                    >
                                      <Pencil className="size-3.5" />
                                    </Button>
                                  </Can>

                                  {!isSuperadmin && (
                                    <Can do="roles:delete">
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => void handleDelete(role.id, role.name)}
                                        title="Hapus Role"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </Can>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {paging && (
                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <p className="text-xs text-muted-foreground">
                        Halaman {paging.page} dari {paging.total_page} · Total {paging.total_item} role
                      </p>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={paging.page <= 1}
                          onClick={() => void handlePageChange(page - 1)}
                        >
                          Sebelumnya
                        </Button>
                        <Button
                          type="button"
                          size="sm"
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
