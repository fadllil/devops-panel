import { useEffect, useState, type FormEvent } from "react"
import { Pencil, PlusCircle, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

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
import { createRole, deleteRole, getRolePage, updateRole } from "../api/roles"
import type { PageMetadata, RoleSummary } from "../types/auth"

const PAGE_SIZE = 10

export function RolesPage() {
  const [roles, setRoles] = useState<RoleSummary[]>([])
  const [page, setPage] = useState(1)
  const [paging, setPaging] = useState<PageMetadata | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [sortField, setSortField] = useState<"created_at" | "name">("created_at")
  const [sortBy, setSortBy] = useState<"ASC" | "DESC">("DESC")
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshRoles(1, "")
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      if (editingId) {
        await updateRole(editingId, { name })
        toast.success("Role berhasil diperbarui")
      } else {
        await createRole({ name })
        toast.success("Role berhasil dibuat")
      }

      setName("")
      setEditingId(null)
      await refreshRoles(page, searchText)
    } catch (error) {
      toast.error("Gagal menyimpan role")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (role: RoleSummary) => {
    setEditingId(role.id)
    setName(role.name)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteRole(id)
      toast.success("Role berhasil dihapus")
      await refreshRoles(page, searchText)
    } catch (error) {
      toast.error("Gagal menghapus role")
      console.error(error)
    }
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground bg-muted">
      <Sidebar active="roles" />

      <section className="flex-1 p-4 md:p-8">
        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit Role" : "Tambah Role"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Nama Role</label>
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Super Admin"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={submitting}>
                    <PlusCircle className="mr-2 size-4" />
                    {submitting ? "Menyimpan..." : editingId ? "Update Role" : "Tambah Role"}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null)
                        setName("")
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
              <CardTitle>Role Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Cari nama role"
                      className="pl-9"
                    />
                  </div>
                </form>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    value={sortField}
                    onChange={(event) => void handleSortChange(event.target.value as "created_at" | "name", sortBy)}
                    className="flex h-9 min-w-40 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="created_at">Urutkan: Terbaru</option>
                    <option value="name">Urutkan: Nama</option>
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
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-muted-foreground">Memuat role...</p>
              ) : roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Data role tidak ditemukan.</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(role)}>
                                <Pencil className="size-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(role.id)}>
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
                        Halaman {paging.page} dari {paging.total_page} · Total {paging.total_item} role
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
