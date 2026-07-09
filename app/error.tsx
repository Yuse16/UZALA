'use client'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="uzala-bg flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <div className="glass mx-auto w-full max-w-md rounded-3xl px-6 py-10">
        <h1 className="text-xl font-semibold text-foreground">Algo salió mal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ocurrió un error inesperado. Intenta de nuevo.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          Reintentar
        </button>
      </div>
    </main>
  )
}
