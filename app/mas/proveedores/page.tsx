'use client'

import { useState, useMemo } from 'react'
import { useAdvancedActivities, getByProvider } from '@/hooks/use-advanced-activities'
import { ProviderForm } from '@/components/uzala/forms/provider-form'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ChevronRight, Phone, ExternalLink } from 'lucide-react'
import type { Provider } from '@/lib/types'

export default function ProveedoresPage() {
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Provider | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const items = useAdvancedActivities((s) => s.items)

  const providers = useMemo(
    () => items.filter((item): item is Provider => item.type === 'proveedor'),
    [items]
  )

  const selected = selectedId
    ? providers.find((p) => p.id === selectedId) ?? null
    : null

  const relatedItems = selectedId ? getByProvider(selectedId) : []

  return (
    <main className="uzala-bg relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-5 pb-28 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Proveedores</h1>
          <button
            type="button"
            onClick={() => { setEditItem(null); setShowForm(true) }}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            + Nuevo
          </button>
        </div>

        {selected ? (
          <>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="self-start text-sm text-primary"
            >
              ← Volver
            </button>

            <div className="glass rounded-3xl p-4">
              <h2 className="text-lg font-semibold text-foreground">{selected.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{selected.phone}</p>
              <div className="mt-3 flex gap-2">
                <a
                  href={`tel:${selected.phone}`}
                  className="flex items-center gap-1.5 rounded-full bg-primary/15 px-4 py-2 text-sm font-medium text-primary"
                >
                  <Phone className="size-4" />
                  Llamar
                </a>
                {selected.whatsapp && (
                  <a
                    href={`https://wa.me/${selected.whatsapp.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-primary/15 px-4 py-2 text-sm font-medium text-primary"
                  >
                    <ExternalLink className="size-4" />
                    WhatsApp
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => { setEditItem(selected); setShowForm(true) }}
                  className="ml-auto rounded-full bg-foreground/10 px-4 py-2 text-sm text-foreground/70"
                >
                  Editar
                </button>
              </div>
            </div>

            {selected.products.length > 0 && (
              <div className="glass rounded-3xl p-4">
                <h3 className="mb-2 text-sm font-semibold text-foreground">Productos</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.products.map((p) => (
                    <span key={p} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {relatedItems.length > 0 && (
              <div className="glass rounded-3xl">
                <h3 className="px-4 pt-3 text-sm font-semibold text-foreground">
                  Historial ({relatedItems.length})
                </h3>
                {relatedItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={
                      index !== 0
                        ? { borderTop: '1px solid oklch(0.98 0.01 170 / 0.08)' }
                        : undefined
                    }
                  >
                    <span className={`size-3 shrink-0 rounded-full ${
                      item.status === 'completado' ? 'bg-status-success' : 'bg-primary'
                    }`} />
                    <span className="flex-1 text-sm text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.scheduledDate
                        ? new Date(item.scheduledDate).toLocaleDateString('es-MX')
                        : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {selected.description && (
              <div className="glass rounded-3xl p-4">
                <h3 className="mb-1 text-sm font-semibold text-foreground">Notas</h3>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              </div>
            )}
          </>
        ) : providers.length === 0 ? (
          <div className="glass rounded-3xl px-5 py-6 text-center text-sm text-muted-foreground">
            No tienes proveedores registrados
          </div>
        ) : (
          <div className="glass overflow-hidden rounded-3xl">
            {providers.map((provider, index) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => setSelectedId(provider.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors active:bg-foreground/5"
                style={
                  index !== 0
                    ? { borderTop: '1px solid oklch(0.98 0.01 170 / 0.08)' }
                    : undefined
                }
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Phone className="size-4" />
                </span>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-foreground">{provider.title}</span>
                  <span className="text-xs text-muted-foreground">{provider.phone}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {provider.products.length} productos
                </span>
                <ChevronRight className="size-4 text-foreground/40" />
              </button>
            ))}
          </div>
        )}
      </div>

      <Sheet open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditItem(null) }}>
        <SheetContent side="bottom" className="rounded-t-3xl border-none pb-8">
          <SheetHeader>
            <SheetTitle>{editItem ? 'Editar proveedor' : 'Nuevo proveedor'}</SheetTitle>
          </SheetHeader>
          <ProviderForm onSuccess={() => { setShowForm(false); setEditItem(null) }} editItem={editItem ?? undefined} />
        </SheetContent>
      </Sheet>
    </main>
  )
}
