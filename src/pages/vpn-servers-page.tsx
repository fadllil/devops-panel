import { useEffect, useState, type SubmitEvent } from "react"
import {
  Eye,
  EyeOff,
  Info,
  Pencil,
  PlusCircle,
  Search,
  Server,
  Trash2,
} from "lucide-react"
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
import {
  createVPNServer,
  deleteVPNServer,
  getVPNServers,
  updateVPNServer,
} from "../api/vpn-servers"
import type { PageMetadata } from "../types/auth"
import type { CreateVPNServerPayload, VPNServer } from "../types/vpn-server"

interface VPNServerFormState {
  name: string
  ip_address: string
  port: number
  protocol: string
  ssh_host: string
  ssh_port: number
  ssh_user: string
  ssh_key: string
  agent_api_url: string
  agent_token: string
  is_active: boolean
}

const EMPTY_FORM: VPNServerFormState = {
  name: "",
  ip_address: "",
  port: 1194,
  protocol: "udp",
  ssh_host: "",
  ssh_port: 22,
  ssh_user: "root",
  ssh_key: "",
  agent_api_url: "",
  agent_token: "",
  is_active: true,
}

const PAGE_SIZE = 10

export function VPNServersPage() {
  const [servers, setServers] = useState<VPNServer[]>([])
  const [page, setPage] = useState(1)
  const [paging, setPaging] = useState<PageMetadata | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [sortField, setSortField] = useState<"created_at" | "name" | "ip_address">("created_at")
  const [sortBy, setSortBy] = useState<"ASC" | "DESC">("DESC")
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailServer, setDetailServer] = useState<VPNServer | null>(null)
  const [showAgentToken, setShowAgentToken] = useState(false)
  const [form, setForm] = useState<VPNServerFormState>(EMPTY_FORM)

  const refreshServers = async (
    nextPage = page,
    nextSearch = searchText,
    nextSortField = sortField,
    nextSortBy = sortBy,
    nextPageSize = pageSize,
  ) => {
    setLoading(true)

    try {
      const response = await getVPNServers({
        page: nextPage,
        size: nextPageSize,
        search: nextSearch,
        sort_field: nextSortField,
        sort_by: nextSortBy,
      })

      setServers(response.data)
      setPaging(response.paging)
    } catch (error) {
      toast.error("Gagal memuat data VPN Server")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshServers(1, "")
  }, [])

  const filteredServers = statusFilter
    ? servers.filter((s) => String(s.is_active) === statusFilter)
    : servers

  const handleSearch = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(1)
    setSearchText(searchInput)
    await refreshServers(1, searchInput, sortField, sortBy, pageSize)
  }

  const handleSortChange = async (
    nextSortField: "created_at" | "name" | "ip_address",
    nextSortBy: "ASC" | "DESC",
  ) => {
    setSortField(nextSortField)
    setSortBy(nextSortBy)
    setPage(1)
    await refreshServers(1, searchText, nextSortField, nextSortBy, pageSize)
  }

  const handlePageSizeChange = async (nextPageSize: number) => {
    setPageSize(nextPageSize)
    setPage(1)
    await refreshServers(1, searchText, sortField, sortBy, nextPageSize)
  }

  const handlePageChange = async (nextPage: number) => {
    setPage(nextPage)
    await refreshServers(nextPage, searchText, sortField, sortBy, pageSize)
  }

  const handleOpenCreateModal = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowAgentToken(false)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowAgentToken(false)
  }

  const handleEdit = (server: VPNServer) => {
    setEditingId(server.id)
    setForm({
      name: server.name,
      ip_address: server.ip_address,
      port: server.port,
      protocol: server.protocol,
      ssh_host: server.ssh_host || "",
      ssh_port: server.ssh_port || 22,
      ssh_user: server.ssh_user || "",
      ssh_key: server.ssh_key || "",
      agent_api_url: server.agent_api_url,
      agent_token: server.agent_token,
      is_active: server.is_active,
    })
    setShowAgentToken(false)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus server "${name}"?`)) {
      return
    }

    try {
      await deleteVPNServer(id)
      toast.success("VPN Server berhasil dihapus")
      await refreshServers(page, searchText)
    } catch (error) {
      toast.error("Gagal menghapus VPN Server")
      console.error(error)
    }
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)

    const payload: CreateVPNServerPayload = {
      name: form.name.trim(),
      ip_address: form.ip_address.trim(),
      port: Number(form.port),
      protocol: form.protocol,
      ssh_host: form.ssh_host.trim(),
      ssh_port: Number(form.ssh_port),
      ssh_user: form.ssh_user.trim(),
      ssh_key: form.ssh_key.trim(),
      agent_api_url: form.agent_api_url.trim(),
      agent_token: form.agent_token.trim(),
      is_active: form.is_active,
    }

    try {
      if (editingId) {
        await updateVPNServer(editingId, payload)
        toast.success("VPN Server berhasil diperbarui")
      } else {
        await createVPNServer(payload)
        toast.success("VPN Server berhasil dibuat")
      }

      handleCloseModal()
      await refreshServers(page, searchText)
    } catch (error) {
      toast.error("Gagal menyimpan VPN Server. Periksa kembali form Anda.")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground bg-muted">
      <Sidebar active="vpn-servers" />

      <section className="flex-1 p-4 md:p-8 overflow-hidden">
        <Card className="w-full">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Server className="size-5 text-primary" />
                <CardTitle className="text-xl font-bold">OpenVPN Server Management</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Kelola infrastruktur server OpenVPN, endpoint VPN Agent, dan kredensial SSH.
              </p>
            </div>
            <Button onClick={handleOpenCreateModal} className="shrink-0">
              <PlusCircle className="mr-2 size-4" />
              Tambah Server
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Toolbar: Search, Filters & Sorting */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Cari nama atau IP address server..."
                    className="pl-9 h-9"
                  />
                </div>
              </form>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={sortField}
                  onChange={(event) =>
                    void handleSortChange(
                      event.target.value as "created_at" | "name" | "ip_address",
                      sortBy,
                    )
                  }
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="created_at">Urutkan: Terbaru</option>
                  <option value="name">Urutkan: Nama</option>
                  <option value="ip_address">Urutkan: IP Address</option>
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
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="flex h-9 min-w-32 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Semua Status</option>
                  <option value="true">Aktif</option>
                  <option value="false">Tidak Aktif</option>
                </select>
              </div>
            </div>

            {/* Horizontal Scroll Table */}
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Memuat data VPN Server...
              </div>
            ) : filteredServers.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Data VPN Server tidak ditemukan.
              </div>
            ) : (
              <>
                <div className="w-full overflow-x-auto rounded-lg border border-border">
                  <Table className="min-w-[920px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[180px] whitespace-nowrap">Nama Server</TableHead>
                        <TableHead className="min-w-[160px] whitespace-nowrap">IP & Port</TableHead>
                        <TableHead className="min-w-[100px] whitespace-nowrap">Protokol</TableHead>
                        <TableHead className="min-w-[220px] whitespace-nowrap">VPN Agent API</TableHead>
                        <TableHead className="min-w-[160px] whitespace-nowrap">SSH Host</TableHead>
                        <TableHead className="min-w-[110px] whitespace-nowrap">Status</TableHead>
                        <TableHead className="min-w-[110px] whitespace-nowrap text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServers.map((server) => (
                        <TableRow key={server.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-primary/60" />
                              {server.name}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs">
                            {server.ip_address}:{server.port}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="uppercase font-mono text-[11px]">
                              {server.protocol}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                            {server.agent_api_url}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                            {server.ssh_host ? (
                              `${server.ssh_user || "root"}@${server.ssh_host}:${server.ssh_port || 22}`
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant={server.is_active ? "success" : "danger"}>
                              {server.is_active ? "Aktif" : "Tidak Aktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDetailServer(server)}
                                title="Lihat Detail"
                              >
                                <Info className="size-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(server)}
                                title="Edit Server"
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(server.id, server.name)}
                                title="Hapus Server"
                              >
                                <Trash2 className="size-3.5" />
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
                      Halaman {paging.page} dari {paging.total_page} · Total {paging.total_item} server
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

        {/* Modal Form Tambah / Edit VPN Server */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Server OpenVPN" : "Tambah Server OpenVPN Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Perbarui konfigurasi host, kredensial agent, dan status server."
                  : "Daftarkan server OpenVPN baru agar dapat dikelola dan menerbitkan sertifikat client."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {/* Grup 1: Informasi Utama */}
              <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Informasi Jaringan
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="server-name">Nama Server</Label>
                    <Input
                      id="server-name"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. SG-OpenVPN-Prod"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="server-ip">IP Address</Label>
                    <Input
                      id="server-ip"
                      value={form.ip_address}
                      onChange={(e) => setForm((prev) => ({ ...prev, ip_address: e.target.value }))}
                      placeholder="e.g. 103.145.22.10"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="server-port">Port</Label>
                      <Input
                        id="server-port"
                        type="number"
                        value={form.port}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, port: Number(e.target.value) || 1194 }))
                        }
                        placeholder="1194"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="server-proto">Protokol</Label>
                      <select
                        id="server-proto"
                        value={form.protocol}
                        onChange={(e) => setForm((prev) => ({ ...prev, protocol: e.target.value }))}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        disabled={submitting}
                      >
                        <option value="udp">UDP</option>
                        <option value="tcp">TCP</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="server-active">Status Server</Label>
                  <select
                    id="server-active"
                    value={String(form.is_active)}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, is_active: e.target.value === "true" }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={submitting}
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              {/* Grup 2: Integrasi VPN Agent */}
              <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Integrasi VPN Agent (Port 8443)
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor="agent-url">Agent API URL</Label>
                  <Input
                    id="agent-url"
                    value={form.agent_api_url}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, agent_api_url: e.target.value }))
                    }
                    placeholder="http://103.145.22.10:8443"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="agent-token">Agent Token</Label>
                  <div className="relative">
                    <Input
                      id="agent-token"
                      type={showAgentToken ? "text" : "password"}
                      value={form.agent_token}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, agent_token: e.target.value }))
                      }
                      placeholder="Bearer token yang diatur di vpn-agent (.env)"
                      className="pr-10"
                      required
                      disabled={submitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setShowAgentToken((prev) => !prev)}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                      aria-label={showAgentToken ? "Sembunyikan token" : "Tampilkan token"}
                    >
                      {showAgentToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Grup 3: Akses SSH (Opsional) */}
              <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Kredensial SSH (Opsional)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="ssh-host">SSH Host</Label>
                    <Input
                      id="ssh-host"
                      value={form.ssh_host}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, ssh_host: e.target.value }))
                      }
                      placeholder="103.145.22.10 atau domain"
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ssh-port">SSH Port</Label>
                    <Input
                      id="ssh-port"
                      type="number"
                      value={form.ssh_port}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, ssh_port: Number(e.target.value) || 22 }))
                      }
                      placeholder="22"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ssh-user">SSH Username</Label>
                  <Input
                    id="ssh-user"
                    value={form.ssh_user}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, ssh_user: e.target.value }))
                    }
                    placeholder="root"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ssh-key">SSH Private Key / Password</Label>
                  <textarea
                    id="ssh-key"
                    rows={2}
                    value={form.ssh_key}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, ssh_key: e.target.value }))
                    }
                    placeholder="-----BEGIN OPENSSH PRIVATE KEY----- ..."
                    className="flex w-full rounded-md border border-input bg-background p-2 font-mono text-xs text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={submitting}
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
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
                      : "Daftarkan Server"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Detail Info VPN Server */}
        {detailServer && (
          <Dialog open={Boolean(detailServer)} onOpenChange={(open) => !open && setDetailServer(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Server className="size-5 text-primary" />
                  <DialogTitle>Detail Server: {detailServer.name}</DialogTitle>
                </div>
                <DialogDescription>
                  Informasi teknis dan integrasi OpenVPN Server.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 pt-2 text-sm">
                <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-3">
                  <div>
                    <span className="text-xs text-muted-foreground block">ID Server</span>
                    <span className="font-mono text-xs">{detailServer.id}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Status</span>
                    <Badge variant={detailServer.is_active ? "success" : "danger"}>
                      {detailServer.is_active ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">IP Address</span>
                    <span className="font-mono">{detailServer.ip_address}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Port & Protokol</span>
                    <span className="font-mono">{detailServer.port} / {detailServer.protocol.toUpperCase()}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground block">VPN Agent API URL</span>
                    <span className="font-mono text-xs">{detailServer.agent_api_url}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Agent Token</span>
                    <span className="font-mono text-xs break-all text-muted-foreground">
                      {detailServer.agent_token}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                  <span className="text-xs text-muted-foreground block">Akses SSH</span>
                  <span className="font-mono text-xs">
                    {detailServer.ssh_host
                      ? `${detailServer.ssh_user || "root"}@${detailServer.ssh_host}:${detailServer.ssh_port || 22}`
                      : "Tidak dikonfigurasi"}
                  </span>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setDetailServer(null)}>
                  Tutup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </section>
    </main>
  )
}
