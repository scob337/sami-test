'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { 
  Plus, MoreVertical, Edit, Trash2, BookOpen, 
  FileText, Download, Upload, Search, ShoppingBag,
  CheckCircle2, XCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { BookFormModal } from '@/components/admin/book-form-modal'
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog'
import { toast } from 'sonner'

interface Book {
  id: number
  title: string
  description?: string | null
  filePdf: string
  price: number
  isActive: boolean
  createdAt: string
  _count: { tests: number; payments: number }
}

export default function BooksPage() {
  const { data: booksData, isLoading, mutate } = useSWR<Book[]>('/api/admin/books', fetcher)
  const books = booksData || []

  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editBook, setEditBook] = useState<Book | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/books/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('تم حذف الكتاب بنجاح')
      setDeleteId(null)
      mutate()
    } catch { toast.error('فشل الحذف') }
    finally { setIsDeleting(false) }
  }

  const openAdd = () => { setEditBook(null); setModalOpen(true) }
  const openEdit = (b: Book) => { setEditBook(b); setModalOpen(true) }

  const filtered = useMemo(() => {
    return books.filter(b =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [books, searchTerm])

  const totalSales = useMemo(() => {
    return books.reduce((s, b) => s + (b._count?.payments ?? 0), 0)
  }, [books])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">إدارة الكتب</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {books.length} كتاب • إجمالي المبيعات: {totalSales} عملية
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-[#ff5722] hover:bg-[#e64a19] text-white shadow-lg shadow-orange-500/20 px-6 h-12 font-black transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 ml-1" />
          إضافة كتاب جديد
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-border shadow-sm max-w-sm focus-within:border-blue-500/50 transition-colors">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="ابحث عن كتاب..."
          className="bg-transparent border-none focus:outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((book) => (
            <Card
              key={book.id}
              className="group border border-border/50 shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-900 rounded-2xl overflow-hidden"
            >
              {/* Book Cover Area */}
              <div className="relative h-48 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden border-b border-border/30">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-blue-500/5 to-blue-500/15" />
                <div className="w-24 h-32 rounded-xl bg-white dark:bg-slate-900 shadow-lg border border-border flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                </div>
                <div className="absolute top-3 right-3">
                  <Badge
                    variant="secondary"
                    className={`text-xs font-semibold border-0 ${
                      book.isActive
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {book.isActive ? (
                      <><CheckCircle2 className="w-3 h-3 ml-1 inline" />نشط</>
                    ) : (
                      <><XCircle className="w-3 h-3 ml-1 inline" />معطل</>
                    )}
                  </Badge>
                </div>
                <div className="absolute top-3 left-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
                      >
                        <MoreVertical className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="rounded-xl shadow-xl border-border bg-white dark:bg-slate-900 min-w-[150px]">
                      <DropdownMenuItem
                        onClick={() => openEdit(book)}
                        className="flex items-center gap-2.5 cursor-pointer py-3 text-[#15283c] dark:text-slate-200 font-bold focus:bg-slate-50 dark:focus:bg-slate-800"
                      >
                        <Edit className="w-4 h-4 text-[#ff5722]" /> تعديل بيانات الكتاب
                      </DropdownMenuItem>
                      {book.filePdf && (
                        <DropdownMenuItem asChild>
                          <a href={book.filePdf} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 cursor-pointer py-2.5 text-foreground focus:bg-accent">
                            <Download className="w-4 h-4" /> تحميل PDF
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(book.id)}
                        className="flex items-center gap-2.5 cursor-pointer py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" /> حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-black text-[#1e293b] dark:text-slate-200 leading-snug text-base">{book.title}</h3>
                  {book.description && (
                    <p className="text-xs font-medium text-[#64748b] dark:text-slate-400 mt-1.5 line-clamp-2">{book.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-sm">
                    <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{book._count?.payments ?? 0} مبيعة</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{book._count?.tests ?? 0} اختبار</span>
                  </div>
                  <span className="font-bold text-primary text-sm">{book.price} ر.س</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Card */}
          <button
            onClick={openAdd}
            className="border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-all group min-h-[260px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-[#ff5722] group-hover:text-white text-slate-400 flex items-center justify-center transition-all mb-4 shadow-sm">
              <Plus className="w-8 h-8" />
            </div>
            <span className="font-black text-[#64748b] dark:text-slate-400 group-hover:text-[#ff5722] transition-colors text-sm">
              إضافة كتاب جديد للمتجر
            </span>
          </button>
        </div>
      )}

      <BookFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={mutate}
        editBook={editBook}
      />

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="حذف الكتاب"
        description="سيتم حذف هذا الكتاب وجميع اختباراته المرتبطة به نهائياً."
      />
    </div>
  )
}
