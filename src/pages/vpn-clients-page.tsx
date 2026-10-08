import { useEffect, useState, type SubmitEvent } from "react"
import dayjs from "dayjs"
import {
  Download,
  Eye,
  EyeOff,
  Info,
  Mail,
  Pencil,
  PlusCircle,
  Search,
  Shield,
  Trash2,
  Users,
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
import { getAllVPNServers } from "../api/vpn-servers"
import {
  createVPNClient,
  deleteVPNClient,
  downloadVPNClientConfig,
  getVPNClients,
  sendVPNClientConfigEmail,
  updateVPNClient,
} from "../api/vpn-clients"
import type { PageMetadata } from "../types/auth"
import type { CreateVPNClientPayload, UpdateVPNClientPayload, VPNClient } from "../types/vpn-client"
import type { VPNServer } from "../types/vpn-server"

interface VPNClientFormState {
  server_id: string
  username: string
  password: string
  email: string
  static_ip: string
  description: string
  is_active: boolean
}

const EMPTY_FORM: VPNClientFormState = {
  server_id: "",
  username: "",
  password: "",
  email: "",
  static_ip: "",
  description: "",
  is_active: true,
}

const PAGE_SIZE = 10

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(dateStr?: string): string {
  if (!dateStr || dateStr.startsWith("0001") || dateStr.startsWith("1970")) {
    return "Belum pernah"
  }
  return dayjs(dateStr).format("DD MMM YYYY, HH:mm")
}

export function VPNClientsPage() {
  const [clients, setClients] = useState<VPNClient[]>([])
  const [servers, setServers] = useState<VPNServer[]>([])
  const [page, setPage] = useState(1)
  const [paging, setPaging] = useState<PageMetadata | null>(null)
  const [searchText, setSearchText] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [serverFilter, setServerFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sortField, setSortField] = useState<"created_at" | "username" | "email">("created_at")
  const [sortBy, setSortBy] = useState<"ASC" | "DESC">("DESC")
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailClient, setDetailClient] = useState<VPNClient | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState<VPNClientFormState>(EMPTY_FORM)

  const refreshClients = async (
    nextPage = page,
    nextSearch = searchText,
    nextSortField = sortField,
    nextSortBy = sortBy,
    nextPageSize = pageSize,
  ) => {
    setLoading(true)

    try {
      const [clientResponse, serverList] = await Promise.all([
        getVPNClients({
          page: nextPage,
          size: nextPageSize,
          search: nextSearch,
          sort_field: nextSortField,
          sort_by: nextSortBy,
        }),
        getAllVPNServers(),
      ])

      setClients(clientResponse.data)
      setPaging(clientResponse.paging)
      setServers(serverList)
    } catch (error) {
      toast.error("Gagal memuat data VPN Client")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshClients(1, "")
  }, [])

  const serverMap = Object.fromEntries(servers.map((s) => [s.id, s.name]))

  const filteredClients = clients.filter((client) => {
    if (serverFilter && client.server_id !== serverFilter) {
      return false
    }
    if (statusFilter && String(client.is_active) !== statusFilter) {
      return false
    }
    return true
  })

  const handleSearch = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(1)
    setSearchText(searchInput)
    await refreshClients(1, searchInput, sortField, sortBy, pageSize)
  }

  const handleSortChange = async (
    nextSortField: "created_at" | "username" | "email",
    nextSortBy: "ASC" | "DESC",
  ) => {
    setSortField(nextSortField)
    setSortBy(nextSortBy)
    setPage(1)
    await refreshClients(1, searchText, nextSortField, nextSortBy, pageSize)
  }

  const handlePageSizeChange = async (nextPageSize: number) => {
    setPageSize(nextPageSize)
    setPage(1)
    await refreshClients(1, searchText, sortField, sortBy, nextPageSize)
  }

  const handlePageChange = async (nextPage: number) => {
    setPage(nextPage)
    await refreshClients(nextPage, searchText, sortField, sortBy, pageSize)
  }

  const handleOpenCreateModal = () => {
    setEditingId(null)
    setForm({
      ...EMPTY_FORM,
      server_id: servers[0]?.id || "",
    })
    setShowPassword(false)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowPassword(false)
  }

  const handleEdit = (client: VPNClient) => {
    setEditingId(client.id)
    setForm({
      server_id: client.server_id,
      username: client.username,
      password: "",
      email: client.email,
      static_ip: client.static_ip || "",
      description: client.description || "",
      is_active: client.is_active,
    })
    setShowPassword(false)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, username: string) => {
    if (
      !window.confirm(
        `PERINGATAN: Menghapus client "${username}" akan merevoke sertifikat di VPN Agent secara permanen. Lanjutkan?`,
      )
    ) {
      return
    }

    try {
      await deleteVPNClient(id)
      toast.success(`Client "${username}" berhasil dihapus dan direvoke`)
      await refreshClients(page, searchText)
    } catch (error) {
      toast.error("Gagal menghapus client. Pastikan VPN Agent online.")
      console.error(error)
    }
  }

  const handleDownload = async (client: VPNClient) => {
    setDownloadingId(client.id)
    try {
      await downloadVPNClientConfig(client.id, client.username)
      toast.success(`Config profile "${client.username}.ovpn" berhasil diunduh`)
    } catch (error) {
      toast.error("Gagal mengunduh file config OpenVPN")
      console.error(error)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleSendEmail = async (client: VPNClient) => {
    if (!window.confirm(`Kirim file konfigurasi .ovpn ke email "${client.email}"?`)) {
      return
    }

    setSendingEmailId(client.id)
    try {
      await sendVPNClientConfigEmail(client.id)
      toast.success(`Config berhasil dikirim ke ${client.email}`)
    } catch (error) {
      toast.error("Gagal mengirim email konfigurasi")
      console.error(error)
    } finally {
      setSendingEmailId(null)
    }
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      if (editingId) {
        const updatePayload: UpdateVPNClientPayload = {
          server_id: form.server_id,
          username: form.username.trim(),
          password: form.password ? form.password.trim() : undefined,
          email: form.email.trim(),
          static_ip: form.static_ip ? form.static_ip.trim() : "",
          description: form.description ? form.description.trim() : "",
          is_active: form.is_active,
        }

        await updateVPNClient(editingId, updatePayload)
        toast.success("VPN Client berhasil diperbarui")
      } else {
        const createPayload: CreateVPNClientPayload = {
          server_id: form.server_id,
          username: form.username.trim(),
          password: form.password.trim(),
          email: form.email.trim(),
          static_ip: form.static_ip ? form.static_ip.trim() : undefined,
          description: form.description ? form.description.trim() : undefined,
        }

        const newClient = await createVPNClient(createPayload)
        toast.success(`VPN Client "${newClient.username}" berhasil dibuat dan sertifikat diterbitkan`)
      }

      handleCloseModal()
      await refreshClients(page, searchText)
    } catch (error) {
      toast.error("Gagal menyimpan VPN Client. Periksa server agent dan form Anda.")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground bg-muted">
      <Sidebar active="vpn-clients" />

      <section className="flex-1 p-4 md:p-8 overflow-hidden">
        <Card className="w-full">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                <CardTitle className="text-xl font-bold">OpenVPN Client Management</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Kelola akun client OpenVPN, penerbitan sertifikat, download profil .ovpn, dan monitoring trafik.
              </p>
            </div>
            <Button onClick={handleOpenCreateModal} className="shrink-0">
              <PlusCircle className="mr-2 size-4" />
              Tambah Client
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Toolbar: Search, Server filter, Status filter, Sorting */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Cari username atau email client..."
                    className="pl-9 h-9"
                  />
                </div>
              </form>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={serverFilter}
                  onChange={(event) => setServerFilter(event.target.value)}
                  className="flex h-9 min-w-36 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Semua Server</option>
                  {servers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
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
              </div>
            </div>

            {/* Horizontal Scroll Table */}
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Memuat data VPN Client...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Data VPN Client tidak ditemukan.
              </div>
            ) : (
              <>
                <div className="w-full overflow-x-auto rounded-lg border border-border">
                  <Table className="min-w-[1040px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[170px] whitespace-nowrap">Client</TableHead>
                        <TableHead className="min-w-[160px] whitespace-nowrap">Server VPN</TableHead>
                        <TableHead className="min-w-[190px] whitespace-nowrap">Email</TableHead>
                        <TableHead className="min-w-[130px] whitespace-nowrap">IP Client</TableHead>
                        <TableHead className="min-w-[110px] whitespace-nowrap">Status</TableHead>
                        <TableHead className="min-w-[150px] whitespace-nowrap">Terakhir Konek</TableHead>
                        <TableHead className="min-w-[150px] whitespace-nowrap">Trafik Data</TableHead>
                        <TableHead className="min-w-[160px] whitespace-nowrap text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={`size-2 rounded-full ${
                                  client.is_active ? "bg-emerald-500" : "bg-zinc-400"
                                }`}
                              />
                              <div>
                                <p className="font-semibold">{client.username}</p>
                                {client.description && (
                                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                    {client.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="font-normal text-xs">
                              {serverMap[client.server_id] || "Server tidak dikenal"}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {client.email}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs">
                            {client.static_ip ? (
                              <span className="text-foreground">{client.static_ip}</span>
                            ) : (
                              <span className="text-muted-foreground italic">Dynamic</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant={client.is_active ? "success" : "danger"}>
                              {client.is_active ? "Aktif" : "Revoked / Off"}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDate(client.last_connected_at)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                            <span>↓ {formatBytes(client.bytes_received)}</span>{" "}
                            <span className="opacity-70">/ ↑ {formatBytes(client.bytes_sent)}</span>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void handleDownload(client)}
                                disabled={downloadingId === client.id}
                                title="Download Config (.ovpn)"
                              >
                                <Download className="size-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void handleSendEmail(client)}
                                disabled={sendingEmailId === client.id}
                                title="Kirim ke Email"
                              >
                                <Mail className="size-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDetailClient(client)}
                                title="Detail Info"
                              >
                                <Info className="size-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(client)}
                                title="Edit Client"
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => void handleDelete(client.id, client.username)}
                                title="Revoke & Hapus"
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
                      Halaman {paging.page} dari {paging.total_page} · Total {paging.total_item} client
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

        {/* Modal Form Tambah / Edit VPN Client */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Client OpenVPN" : "Terbitkan Akun Client Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Perbarui data client atau ganti password autentikasi."
                  : "Mendaftarkan client baru dan menerbitkan sertifikat otomatis via VPN Agent."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="client-server">Server VPN Tujuan</Label>
                <select
                  id="client-server"
                  value={form.server_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, server_id: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                  disabled={submitting}
                >
                  <option value="">Pilih Server VPN</option>
                  {servers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.ip_address}:{s.port})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-username">Username Client</Label>
                <Input
                  id="client-username"
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="e.g. john.doe"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="client-password">
                    {editingId ? "Password Baru (Kosongkan jika tidak diubah)" : "Password Client"}
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="client-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder={editingId ? "Biarkan kosong untuk password lama" : "••••••••"}
                    required={!editingId}
                    disabled={submitting}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-email">Email Penerima</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@company.com"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-static-ip">Static IP (Opsional)</Label>
                <Input
                  id="client-static-ip"
                  value={form.static_ip}
                  onChange={(e) => setForm((prev) => ({ ...prev, static_ip: e.target.value }))}
                  placeholder="e.g. 10.8.0.50 (kosongkan jika dinamis)"
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-desc">Deskripsi / Perangkat (Opsional)</Label>
                <Input
                  id="client-desc"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Laptop MacBook IT Staff"
                  disabled={submitting}
                />
              </div>

              {editingId && (
                <div className="space-y-2">
                  <Label htmlFor="client-status">Status Akun</Label>
                  <select
                    id="client-status"
                    value={String(form.is_active)}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, is_active: e.target.value === "true" }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={submitting}
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif / Revoked</option>
                  </select>
                </div>
              )}

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
                    ? "Memproses..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Terbitkan Client"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Detail Client */}
        {detailClient && (
          <Dialog open={Boolean(detailClient)} onOpenChange={(open) => !open && setDetailClient(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  <DialogTitle>Detail Client: {detailClient.username}</DialogTitle>
                </div>
                <DialogDescription>
                  Informasi teknis profil dan sertifikat OpenVPN Client.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 pt-2 text-sm">
                <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-3">
                  <div>
                    <span className="text-xs text-muted-foreground block">Server</span>
                    <span className="font-semibold text-xs">
                      {serverMap[detailClient.server_id] || detailClient.server_id}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Status</span>
                    <Badge variant={detailClient.is_active ? "success" : "danger"}>
                      {detailClient.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground block">Email</span>
                    <span className="text-xs">{detailClient.email}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Static IP</span>
                    <span className="font-mono text-xs">
                      {detailClient.static_ip || "Dinamis"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">IP Terakhir</span>
                    <span className="font-mono text-xs">
                      {detailClient.last_ip || "Belum ada"}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                  <span className="text-xs text-muted-foreground block">Nomor Seri Sertifikat</span>
                  <span className="font-mono text-xs break-all">
                    {detailClient.cert_serial || "Tidak tercatat"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-3">
                  <div>
                    <span className="text-xs text-muted-foreground block">Data Diterima</span>
                    <span className="font-mono text-xs">{formatBytes(detailClient.bytes_received)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Data Dikirim</span>
                    <span className="font-mono text-xs">{formatBytes(detailClient.bytes_sent)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground block">Terakhir Konek</span>
                    <span className="text-xs">{formatDate(detailClient.last_connected_at)}</span>
                  </div>
                </div>

                {detailClient.description && (
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <span className="text-xs text-muted-foreground block">Deskripsi</span>
                    <p className="text-xs mt-0.5">{detailClient.description}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2 flex gap-2">
                <Button
                  variant="default"
                  onClick={() => void handleDownload(detailClient)}
                  disabled={downloadingId === detailClient.id}
                >
                  <Download className="mr-2 size-4" />
                  Download .ovpn
                </Button>
                <Button variant="outline" onClick={() => setDetailClient(null)}>
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
