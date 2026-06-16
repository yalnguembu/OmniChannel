import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronsUpDown, Plus, Check, Search, Package } from 'lucide-react'
import { toast } from 'sonner'
import {
  postApiProductSearchOptions,
  postApiProductMutation,
  postApiProductSearchQueryKey,
} from '@/shared/api/generated/@tanstack/react-query.gen'
import { mapToProductModels } from '@/models/product.model'
import type {
  SearchProductResponse,
  CreateProductRequest,
} from '@/shared/api/generated/types.gen'
import { ProductWizard } from '@/components/features/products/ProductWizard'
import { useErrorHandling } from '@/shared/hooks/useErrorHandling'

interface ProductSwitcherProps {
  /** Currently-open product (from the URL), if any. */
  activeProductId?: string
  /** Resolved name of the active product (already fetched by the breadcrumb). */
  activeProductName?: string
}

/**
 * Vercel-style product switcher rendered inside the header breadcrumb.
 * Lets the user jump between products and create one without leaving the page.
 */
export function ProductSwitcher({
  activeProductId,
  activeProductName,
}: ProductSwitcherProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { createMutationErrorHandler } = useErrorHandling()

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [wizardOpen, setWizardOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close the popover on outside click.
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  // Product list — only fetched while the dropdown is open.
  const productsQuery = useQuery({
    ...postApiProductSearchOptions({
      body: { pageNumber: 1, pageSize: 50, sortBy: 'name', sortDirection: 'asc' },
    }),
    select: (res) =>
      mapToProductModels((res?.data?.items ?? []) as SearchProductResponse[]),
    enabled: open,
  })

  const createMutation = useMutation({
    ...postApiProductMutation(),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: postApiProductSearchQueryKey() })
      setWizardOpen(false)
      setOpen(false)
      toast.success('Produit créé avec succès')
      const newId = res?.data?.id ?? res?.data?.data?.id
      if (newId)
        navigate({
          to: '/$productId/overview',
          params: { productId: String(newId) },
        })
    },
    onError: createMutationErrorHandler(),
  })

  const products = productsQuery.data ?? []
  const filtered = search.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : products

  const triggerLabel =
    activeProductName ?? (activeProductId ? '…' : 'Produits')

  const goTo = (id: string) => {
    setOpen(false)
    navigate({ to: '/$productId/overview', params: { productId: id } })
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-[7px] px-2 py-1 -ml-1 hover:bg-[#F0F2F4] transition-colors cursor-pointer"
      >
        <span className="text-[12.5px] font-medium text-[#0D2137] max-w-[180px] truncate">
          {triggerLabel}
        </span>
        <ChevronsUpDown
          size={13}
          className="text-[#8BAFC0] shrink-0"
          strokeWidth={1.8}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-[200] w-[280px] rounded-[10px] border border-[#E5E7EB] bg-white shadow-[0_8px_30px_rgba(13,33,55,0.12)] overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 h-[38px] border-b border-[#F0F2F4]">
            <Search size={13} className="text-[#8BAFC0]" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit…"
              className="w-full border-none outline-none bg-transparent text-[12.5px] text-[#0D2137] placeholder:text-[#8BAFC0]"
            />
          </div>

          {/* List */}
          <div className="max-h-[280px] overflow-y-auto py-1">
            {productsQuery.isLoading ? (
              <div className="px-3 py-4 text-[12px] text-[#8BAFC0] text-center">
                Chargement…
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-4 text-[12px] text-[#8BAFC0] text-center">
                Aucun produit
              </div>
            ) : (
              filtered.map((p) => {
                const active = p.id === activeProductId
                return (
                  <button
                    key={p.id}
                    onClick={() => goTo(p.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[#F7F8F9] ${
                      active ? 'bg-[#F0F7FA]' : ''
                    }`}
                  >
                    <span className="w-6 h-6 rounded-[6px] bg-[#E8F4F8] text-[#2E8FAD] flex items-center justify-center shrink-0">
                      <Package size={12} />
                    </span>
                    <span className="flex-1 text-[12.5px] text-[#0D2137] truncate">
                      {p.name}
                    </span>
                    {active && (
                      <Check size={13} className="text-[#2E8FAD] shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Create */}
          <button
            onClick={() => {
              setWizardOpen(true)
              setOpen(false)
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-[#F0F2F4] text-[12.5px] font-medium text-[#E8541A] hover:bg-[#FFF6F2] transition-colors"
          >
            <Plus size={14} /> Créer un produit
          </button>
        </div>
      )}

      <ProductWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        editingProduct={null}
        onSubmit={(data: CreateProductRequest) =>
          createMutation.mutate({ body: data })
        }
        isPending={createMutation.isPending}
      />
    </div>
  )
}
