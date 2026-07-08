# UZALA — Lógica Funcional del Sistema

**Propósito de este documento:** guía técnica única para que OpenCode implemente la lógica completa de UZALA, fase por fase, sin tocar diseño visual.

**Repositorio analizado:** `github.com/Yuse16/UZALA`
**Commit analizado:** `94d207d` (rama `main`, único branch existente)
**Fecha del análisis:** julio 2026

**Regla de oro para todo el documento:** no se toca `app/globals.css`, no se cambian colores, no se cambia el layout visual de Home. Todo lo que sigue es **cableado de lógica sobre la UI que ya existe**, más pantallas nuevas construidas con los mismos tokens visuales ya definidos.

---

## 0. Cómo usar este documento

Este archivo es la fuente de verdad para la implementación. El orden de las fases (sección 12) importa: cada fase depende de que la anterior esté completa y validada. OpenCode no debe saltar fases ni implementar varias a la vez (ver sección 15, "Prompt para OpenCode").

Antes de escribir código, dos correcciones importantes al planteamiento original del pedido:

1. **`useTodos`, `useCalendarTasks` y `useAdvancedActivities` no existen en el repositorio.** No hay que "unificar" nada porque no hay nada que unificar todavía — el diagnóstico de la sección 1 lo confirma línea por línea. Lo que sí existe es la intención correcta: `useAdvancedActivities` es el nombre que vamos a usar para el motor central, pero se **crea desde cero** en la Fase 1, no se refactoriza.
2. **No hay ninguna fuente de datos, ningún hook, ningún tipo TypeScript de dominio, ninguna pantalla más que Home.** El repo es 100% el cascarón visual generado por v0.app que ya conoces (es literalmente la misma pantalla de la captura que analizamos). Esto no es un defecto — es el punto de partida correcto para construir la arquitectura bien desde el día uno, sin arrastrar decisiones previas.

---

## 1. Diagnóstico del estado actual

### 1.1 Stack real (verificado)

| Capa | Tecnología confirmada |
|---|---|
| Framework | Next.js 16.2.6, App Router (`app/` en la raíz, sin `src/`) |
| UI | React 19, TypeScript 5.7.3 (`strict: true`) |
| Estilos | Tailwind CSS v4 (sintaxis `@theme inline`, sin `tailwind.config.js`) |
| Componentes base | shadcn/ui configurado (`components.json`, estilo `base-nova` sobre Base UI), pero **solo `button.tsx` está instalado** |
| Iconos | `lucide-react` |
| Analítica | `@vercel/analytics` (solo en producción) |
| Estado / datos | **Ninguno.** No hay Zustand, Redux, Context de dominio, Supabase, IndexedDB ni ninguna librería de persistencia |
| Fechas | **Ninguna librería** (no date-fns, no dayjs) |
| Formularios | **Ninguna librería** (no react-hook-form, no zod) |
| PWA runtime | `manifest.json` y metadata de Apple presentes, pero **sin service worker registrado en ningún lado** |
| Tests | No hay configuración de testing |

Gestores de paquetes: el repo tiene **`pnpm-lock.yaml` (del commit inicial) y `package-lock.json` (agregado después) al mismo tiempo.** Esto es un foco de inconsistencia — hay que elegir uno solo antes de la Fase 1 (ver sección 14).

`next.config.mjs` tiene `typescript: { ignoreBuildErrors: true }`. Esto significa que **`npm run build` puede pasar aunque haya errores de tipos.** El gate real durante todo este plan es `npx tsc --noEmit`, no el build. Se recomienda quitar `ignoreBuildErrors` una vez que la capa de datos de la Fase 1 esté estable.

**Verificación real hecha para este diagnóstico:**
- `npx tsc --noEmit` → **pasa limpio, 0 errores.**
- `npm run build` → no se pudo verificar de forma concluyente en el entorno de este análisis por una restricción de red de sandbox hacia `fonts.googleapis.com` (Next intenta descargar la fuente Outfit vía `next/font/google` en build). Esto es una limitación del entorno de análisis, no necesariamente un bug del código. Confirmar con `npm run build` localmente o en Vercel antes de la Fase 1.

### 1.2 Pantallas que existen

**Una sola:** `app/page.tsx` (Home). No existe `/calendario`, `/actividades`, `/mas`, `/habitos`, `/proveedores`, ni ninguna otra ruta. No hay layouts anidados ni grupos de rutas.

### 1.3 Componentes y su estado real

Todos viven en `components/uzala/`. Tabla verificada archivo por archivo:

| Componente | Qué se ve | Lógica real que tiene | Lo que falta |
|---|---|---|---|
| `home-header.tsx` | Campana + logo UZALA | Ninguna. El punto turquesa de "notificación nueva" está **hardcodeado**, siempre visible | `onClick` de campana, punto condicional a datos reales |
| `greeting-card.tsx` | Saludo "Hola" + input + botón `+` + toggle Actividades/Pendientes | Ninguna. El input es **no controlado** (sin `value`/`onChange`), el botón `+` no tiene `onClick`, el toggle no tiene estado — "Actividades" está siempre pintado como activo por clases fijas | Estado del input, parser de texto, `onClick` del `+`, estado real del toggle |
| `stat-cards.tsx` | Tarjetas "Hoy" y "Urgentes" | Ninguna. Los valores están **hardcodeados a `"0"`** (ver commit `bc54e51`, "Reset mock data to 0 for empty state" — antes tenían datos falsos, coincidiendo con la captura que ya vimos) | Selectors derivados de datos reales, `onClick` para navegar al detalle |
| `upcoming-list.tsx` | Lista "Pendientes próximos" | El render (map + chevron) está bien escrito, pero `items` es un **array vacío hardcodeado** (`const items = []`) | Fuente de datos real, estado vacío visible (ahora mismo si `items.length === 0` no se muestra ningún mensaje), `onClick` por fila |
| `bottom-nav.tsx` | Inicio / Calendario / `+` / Más | **Es el único componente con lógica real:** ocultar/mostrar la barra al hacer scroll (`useState` + listener de scroll). Ningún botón tiene `onClick` ni navegación | Navegación real (`next/link` o `router.push`), estado activo por ruta actual, `onClick` del `+` central |
| `logo.tsx` | SVG del logo | Ninguna, es estático | Nada pendiente — se queda igual |

### 1.4 Hooks, tipos y modelo de datos

**No existe ninguno de los tres.** No hay carpeta `hooks/`, no hay `lib/types.ts`, no hay ningún archivo de definición de dominio. `components.json` ya tiene preconfigurado el alias `hooks: "@/hooks"`, así que cuando se cree la carpeta, esa es la ubicación esperada por la convención de shadcn ya establecida en el proyecto.

### 1.5 Tokens de diseño relevantes para lógica (no para rediseño)

Esto importa porque la lógica de estados (completado/vencido/prioridad) necesita colores, y la regla es **no inventar colores nuevos si ya existen tokens utilizables.** Verificado en `app/globals.css`:

- `--destructive` (rojo, `oklch(0.62 0.2 27)`) → **ya existe**, listo para usarse en "vencido".
- `--priority-teal`, `--priority-orange`, `--priority-violet` → **ya existen y no se usan en ningún lado todavía** (son los tres colores de punto que viste en "Pendientes próximos" en la captura original). Se recomienda darles significado semántico como los tres niveles de prioridad (sección 4), en vez de crear nuevas variables.
- **No existe ningún token de verde/éxito.** Esta es la única adición de color necesaria en todo el plan, porque el propio criterio de aceptación de Jorge pide "completados se ven verdes" y ese color no existe en la paleta actual. Se define como una sola variable nueva (`--status-success`), aditiva, sin tocar ninguna existente (detalle en Fase 4).

### 1.6 Resumen ejecutivo del diagnóstico

UZALA hoy es un cascarón visual generado con v0.app: una sola pantalla, seis componentes de presentación, cero conexión a datos, cero navegación real. El único fragmento de lógica genuina en todo el repo es la animación de ocultar la barra inferior al hacer scroll. Todo lo demás — el input, el botón `+`, el toggle, las tarjetas, la lista, los cuatro botones de navegación — es HTML con estilos y ningún comportamiento. Esto no es un problema de "conexiones sueltas": es la ausencia total de una capa de datos, que es exactamente lo que este documento resuelve a partir de la Fase 1.

---

## 2. Objetivo funcional de UZALA

UZALA es un centro de acción diario. La mecánica central, en una frase:

> Tengo algo que recordar → lo escribo rápido → UZALA lo convierte en actividad, pendiente, recordatorio o hábito → lo veo en mi día.

El sistema completo trabaja sobre **7 tipos de elemento** (las entidades de datos) y **2 vistas** (formas de consultar esas entidades, no tipos nuevos):

**Tipos de elemento (tienen su propio registro en la base de datos):**
Actividad · Pendiente · Recordatorio · Hábito · Por surtir · Proveedor · Nota

**Vistas (consultan los tipos de elemento, no almacenan nada propio):**
Calendario · Historial

Esta distinción es la base de la sección 3: si Calendario o Historial necesitaran su propia copia de los datos, ya tendríamos la duplicación que este documento existe para evitar.

**Restricciones activas durante todo este plan** (no son sugerencias, son límites del alcance):
- Sin Supabase todavía — persistencia 100% local.
- Sin login/autenticación todavía.
- Sin IA todavía — la clasificación de texto libre es heurística basada en reglas, no un modelo.
- Sin push notifications reales (requieren backend) — solo notificaciones locales.

---

## 3. Fuente única de datos — arquitectura

### 3.1 Decisión

`useAdvancedActivities` es un **store de Zustand** (con middleware `persist` sobre `localStorage`) que actúa como única fuente de verdad. No es un hook más entre varios — es el único lugar donde vive el estado de todos los elementos.

Zustand es la única dependencia nueva que se agrega en la Fase 1 (`npm install zustand`). La razón para elegirlo sobre Context + `useReducer`: evita renders innecesarios en pantallas con listas (Calendario, Historial, Actividades) porque los componentes se suscriben solo a los selectors que usan, no al estado completo.

### 3.2 Capas (de abajo hacia arriba)

```
lib/types.ts              → interfaces y uniones de dominio (sección 4)
lib/storage.ts             → adaptador de persistencia (localStorage hoy, swap-eable después)
lib/date-utils.ts          → helpers puros: isOverdue, isToday, matchesWeekday, etc.
lib/quick-capture-parser.ts → clasificador heurístico de texto libre (Fase 2)
hooks/use-advanced-activities.ts → el store Zustand + todos los selectors
```

`lib/storage.ts` es la única capa que sabe que hoy los datos viven en `localStorage`. Ningún componente ni selector llama a `localStorage` directamente — todos pasan por este adaptador. Esto es lo que permite migrar a Supabase más adelante tocando un solo archivo, sin refactorizar toda la app. No se implementa ahora — es solo la costura que se deja lista.

### 3.3 Regla de no-duplicación (obligatoria)

- Ningún componente guarda su propia copia de una lista de elementos en `useState` local. Todo se lee a través de un selector del store.
- Si en algún momento se crean `useTodos` o `useCalendarTasks` (por ejemplo porque OpenCode los genera siguiendo una convención de nombres), **deben ser wrappers delgados sobre `useAdvancedActivities`**, nunca estado independiente. Ejemplo de lo que sí está permitido:

```ts
// hooks/use-todos.ts — permitido: es una vista, no una fuente nueva
export function useTodos() {
  return useAdvancedActivities((state) => state.getByType('pendiente'))
}
```

Lo que **no** está permitido es que `use-todos.ts` tenga su propio `useState`/`useEffect` con su propio array de pendientes leído directamente de `localStorage`. Eso es exactamente la duplicación que hay que evitar.

### 3.4 Selectors mínimos que expone el store

`getToday()` · `getUrgent()` · `getUpcoming(limit)` · `getByType(type)` · `getByDate(date)` · `getHistory()` · `getByProvider(providerId)` · `isOverdue(item)` (función pura, no selector de estado) · `addItem(item)` · `updateItem(id, changes)` · `completeItem(id)` · `omitItem(id)` · `deleteItem(id)`

Todas las pantallas (Home, Calendario, Actividades, Historial, Más) consumen combinaciones de estos mismos selectors. Ninguna pantalla implementa su propio filtrado de "qué es urgente" o "qué está vencido" — esa lógica vive una sola vez en el store.

---

## 4. Modelo de datos recomendado

### 4.1 Decisiones de convención (resuelven la ambigüedad del pedido original)

El pedido original ofrecía nombres en inglés y español para cada campo (`title / titulo`, `status / estado`, etc.). Usar ambos en paralelo sería la misma duplicación que este documento busca eliminar, así que se fija una sola convención:

- **Identificadores de campo: en inglés** (`id`, `title`, `description`, `status`, `priority`, `createdAt`...). Es consistente con el resto del código ya escrito (100% en inglés: nombres de componentes, props, la convención `useAdvancedActivities` que tú mismo propusiste).
- **Valores de los enums de dominio: en español**, porque reflejan vocabulario del negocio y de la UI ya visible (`'pendiente'`, `'completado'`, `'actividad'`...), igual que ya hace el resto de la app en su copy.

### 4.2 Nota de arquitectura: "vencido" no se guarda

El pedido lista cinco estados: `pendiente en_proceso completado vencido omitido`. Se recomienda que el campo `status` almacenado solo tenga **cuatro** valores — `vencido` se calcula, no se guarda.

Razón: en una PWA sin backend ni cron, si "vencido" fuera un valor persistido, algo tendría que recorrer todos los elementos y reescribir su estado en el momento exacto en que vence la fecha — y si el usuario no abre la app ese día, el dato queda mintiendo (un pendiente de ayer seguiría diciendo `pendiente` aunque ya esté vencido). Calculándolo al leer, siempre es correcto sin importar cuándo se abrió la app por última vez.

`vencido` sigue existiendo en todos lados donde lo necesitas — Calendario, badges, filtros — solo que como una función derivada:

```ts
function isOverdue(item: BaseItem): boolean {
  if (item.status === 'completado' || item.status === 'omitido') return false
  if (!item.scheduledDate) return false
  return new Date(item.scheduledDate) < new Date()
}
```

### 4.3 Interfaces

```ts
// lib/types.ts

export type ItemType =
  | 'actividad'
  | 'pendiente'
  | 'recordatorio'
  | 'habito'
  | 'por_surtir'
  | 'proveedor'
  | 'nota'

export type ItemStatus = 'pendiente' | 'en_proceso' | 'completado' | 'omitido'

export type Priority = 'baja' | 'media' | 'alta'
// Mapeo recomendado a tokens ya existentes en globals.css (sin crear color nuevo):
//   alta  → var(--priority-violet)
//   media → var(--priority-orange)
//   baja  → var(--priority-teal)

export type Origin = 'captura_rapida' | 'formulario' | 'sistema' | 'importado'

export interface BaseItem {
  id: string
  title: string
  description?: string
  type: ItemType
  status: ItemStatus
  priority: Priority
  createdAt: string        // ISO
  scheduledDate?: string    // ISO — presencia/ausencia de hora define Actividad vs Pendiente, ver 4.4
  completedAt?: string      // ISO
  origin: Origin
}

// --- Actividad: tiene fecha Y hora exacta ---
export interface Activity extends BaseItem {
  type: 'actividad'
}

// --- Pendiente: sin hora exacta todavía ---
export interface Pendiente extends BaseItem {
  type: 'pendiente'
}

// --- Recordatorio: siempre tiene momento exacto + configuración de alerta ---
export interface Reminder extends BaseItem {
  type: 'recordatorio'
  reminderDateTime: string   // ISO, obligatorio
  critical: boolean          // true = se re-notifica hasta marcarse
  notifyBeforeMinutes: number
}

// --- Hábito ---
export interface HabitHistoryEntry {
  date: string                          // ISO, solo fecha (YYYY-MM-DD)
  status: 'completado' | 'omitido'
}

export interface Habit extends BaseItem {
  type: 'habito'
  repeatDays: number[]        // 0=domingo … 6=sábado
  suggestedTime?: string      // "HH:mm"
  currentStreak: number       // calculado, pero cacheado para lectura rápida
  bestStreak: number
  history: HabitHistoryEntry[]
  smartConfig?: null          // reservado para Hábitos Inteligentes Premium — no implementar todavía
}

// --- Por surtir ---
export interface RestockItem extends BaseItem {
  type: 'por_surtir'
  quantity?: number
  unit?: string
  supplierId?: string          // FK a Provider.id — se define ya aunque el módulo Proveedores sea de una fase futura
  dueDate?: string             // ISO
}

// --- Proveedor ---
export interface Provider extends BaseItem {
  type: 'proveedor'
  phone: string
  whatsapp?: string             // normalizado E.164, ej. "+528441234567", listo para wa.me
  products: string[]
  nextCallDate?: string          // ISO
}

// --- Nota ---
export interface Note extends BaseItem {
  type: 'nota'
  body: string
  tags?: string[]
}

export type UzalaItem = Activity | Pendiente | Reminder | Habit | RestockItem | Provider | Note
```

### 4.4 Regla de desambiguación Actividad vs. Pendiente

Esta es la contradicción que ya habíamos detectado en la captura original (los tres ejemplos de "Pendientes próximos" tenían hora exacta, pero por tu propia definición un Pendiente es justo lo que *no* tiene hora exacta). Se resuelve así, de forma explícita:

- **Actividad** = tiene `scheduledDate` con fecha **y** hora concretas.
- **Pendiente** = no tiene `scheduledDate`, o tiene solo fecha sin hora.
- La sección "Pendientes próximos" del Home (ese título de la UI no se toca) en realidad muestra, por datos, **cualquier elemento con hora concreta ordenado cronológicamente** — actividades y recordatorios juntos —, no elementos de tipo literal `pendiente`. Esto es una decisión de mapeo dato↔copy, no un cambio visual: el texto que ves en pantalla sigue diciendo "Pendientes próximos" exactamente igual.

---

## 5. Mapa de botones y funcionamiento

Estado actual verificado en el código (columna izquierda) contra el estado objetivo (columna derecha). Ningún cambio de esta sección modifica clases de Tailwind existentes salvo que se indique explícitamente.

### 5.1 Home

**Campana de notificaciones** (`home-header.tsx`)
- Actual: sin `onClick`, punto turquesa siempre visible (hardcodeado).
- Objetivo: punto visible solo si `getUrgent().length + recordatoriosProximas2h > 0`. `onClick` abre un panel/sheet simple con: vencidos, recordatorios de las próximas 2 horas, hábitos del día sin completar. No requiere pantalla nueva — un `Sheet` de shadcn basta.

**Logo UZALA**
- Actual y objetivo: decorativo. Con una sola ruta en la app no hay "volver al inicio" que resolver. Si en el futuro se agregan más rutas de nivel raíz, se puede envolver en `Link href="/"`.

**Saludo "Hola"**
- Actual: texto estático `"Hola"`, sin nombre — nota: la captura que compartiste sí decía "Hola, Jorge", lo cual confirma que esa versión no es la que está en este repo/commit.
- Objetivo: interpolar un nombre de perfil local simple (`localStorage`, un solo campo `displayName`), sin implicar login/auth. Si no hay nombre guardado, se muestra "Hola" tal cual está hoy.

**Input "Escribe algo rápido..." + botón `+`**
- Actual: input no controlado, botón sin `onClick`.
- Objetivo: input controlado (`useState`), `Enter` o tap en `+` ejecutan `quick-capture-parser.ts` (Fase 2) → `addItem()` del store → limpia el input → muestra confirmación breve del tipo detectado con opción de corregirlo (chip o toast, no modal completo).
- Fase 1 (antes de que exista el parser): el `+` puede crear directamente un `Pendiente` genérico con el texto tal cual como `title`, solo para validar que el ducto de datos funciona de punta a punta.

**Toggle Actividades / Pendientes**
- Actual: clases fijas — "Actividades" siempre se ve activo, "Pendientes" siempre inactivo. No hay estado.
- Objetivo: `useState<'actividades' | 'pendientes'>('actividades')`. Las mismas clases que ya existen (`bg-primary` vs `bg-foreground`) se aplican condicionalmente según el estado, no se crean clases nuevas. Controla qué alimenta la sección "Pendientes próximos" (ver 4.4): `actividades` → cronológico por hora; `pendientes` → por prioridad y luego por fecha.

**Tarjeta "Hoy"**
- Actual: `value="0"` hardcodeado.
- Objetivo: `getToday().length` — cuenta de actividades, pendientes, recordatorios y ocurrencias de hábitos con `scheduledDate`/día de hoy, excluyendo `completado` y `omitido`. `onClick` filtra la vista de Actividades del día actual.

**Tarjeta "Urgentes"**
- Actual: `value="0"` hardcodeado.
- Objetivo: `getUrgent().length` — definición única de "urgente" reutilizada en toda la app: `priority === 'alta'` OR `isOverdue(item)`, sobre elementos activos (no completados/omitidos). Esta es la misma función que usa Por surtir y Proveedores — no hay una definición de "urgente" por módulo.

**Sección "Pendientes próximos"**
- Actual: `items = []` hardcodeado, sin estado vacío.
- Objetivo: `getUpcoming(3)` (o el límite que se defina) según la regla de 4.4. Agregar un estado vacío simple ("No tienes nada programado por ahora") usando las mismas clases `glass`/tipografía ya existentes — esto no es rediseño, es completar un caso que hoy no se contempla visualmente.

**Flechas de cada pendiente**
- Actual: sin `onClick`.
- Objetivo: abre un sheet de detalle/edición (reutiliza el formulario correspondiente al `type` del elemento, precargado) con acciones rápidas: marcar completado, posponer, eliminar.

### 5.2 Bottom Nav

**Inicio**
- Actual: siempre pintado como activo (color fijo), sin `onClick`.
- Objetivo: estado activo real vía `usePathname()`. Como ya está en `/`, el `onClick` puede ser un no-op o `router.push('/')`.

**Calendario**
- Actual: sin destino.
- Objetivo: `next/link` a `/calendario` (nueva ruta, sección 7).

**Botón central `+`**
- Actual: sin `onClick`.
- Objetivo: abre `create-item-sheet.tsx` con las 7 opciones (sección 5.3).

**Más**
- Actual: sin destino.
- Objetivo: `next/link` a `/mas` (hub nuevo: Hábitos, Por surtir, Proveedores, Notas, Historial). Configuración, Perfil y Reportes que mencionaste pueden quedar como entradas visibles con etiqueta "Próximamente" — no están en el alcance de las 8 fases de este documento y no conviene fingir que sí lo están.

### 5.3 Menú `+` (hoja de creación)

Un solo componente nuevo, `create-item-sheet.tsx`, con 7 opciones. En la Fase 2 solo Actividad, Pendiente y Recordatorio abren formulario real — Hábito, Por surtir, Proveedor y Nota se muestran en el menú pero abren un placeholder "disponible en una próxima fase" hasta que llegue su fase correspondiente (5, 6, 7). Esto evita menús que prometen algo que translate a un botón muerto, sin necesitar construir las 7 formas de una vez.

---

## 6. Flujo principal

```
Crear elemento (input rápido, formulario, o desde el menú +)
        │
        ▼
addItem() en el store — único punto de entrada de escritura
        │
        ├─→ Aparece en Inicio          si getToday()/getUrgent()/getUpcoming() lo incluyen
        ├─→ Aparece en Actividades     si type ∈ {actividad, recordatorio} o el toggle "Pendientes" lo filtra
        ├─→ Aparece en Calendario      si tiene scheduledDate (o, para hábitos, si el día coincide con repeatDays)
        │
        ▼
Usuario lo completa → completeItem(id)
        │   status = 'completado', completedAt = now()
        ▼
Desaparece de los selectors "activos" (todos excluyen completado/omitido por definición)
        │
        ▼
Permanece visible en Historial (selector sin filtro de status, orden desc por completedAt/createdAt)
        │
        ▼
Si status === 'completado' → se pinta con --status-success en Calendario (Fase 4)
```

No hay una ruta paralela para "completar desde Calendario" versus "completar desde Home" — ambas llaman a la misma `completeItem(id)` del store. Esto es lo que garantiza que no se dupliquen reglas de negocio por pantalla.

---

## 7. Lógica de calendario

Ruta nueva: `app/calendario/page.tsx`. No existe hoy, así que no hay "rediseño" que evitar aquí — se construye usando los mismos tokens (`glass`, `--primary`, `--priority-*`, `--destructive`, el nuevo `--status-success`) para que se sienta parte de la misma app, sin inventar un lenguaje visual nuevo.

**Cómo se muestran las actividades por día:** cada día con elementos programados muestra un punto/badge por color de prioridad (reutilizando `--priority-teal/orange/violet`, sin nuevas variables).

**Cómo se ven completadas:** el día se pinta (o el badge se pinta) con `--status-success` cuando **todos** los elementos de ese día tienen `status === 'completado'`.

**Cómo se ven vencidas:** badge en `--destructive` cuando `isOverdue(item) === true` para al menos un elemento de ese día pasado.

**Cómo se ven los hábitos:** los hábitos no generan un registro nuevo por cada ocurrencia. Para fechas futuras/actuales, el calendario **proyecta virtualmente** las ocurrencias comparando `repeatDays` contra el día de la semana — no se materializa nada en el store hasta que el usuario efectivamente completa u omite esa ocurrencia puntual (que se guarda como una entrada en `Habit.history`, no como un `UzalaItem` nuevo). Esto evita generar miles de filas de hábitos futuros que nunca se van a usar.

**Cómo se ven los recordatorios:** mismo tratamiento que actividades, con un ícono distinto (campana) reutilizando el ícono `Bell` ya importado en el proyecto.

**Qué pasa al tocar un día:** abre un sheet/lista con todos los elementos de esa fecha (mismo componente de fila que ya existe en `upcoming-list.tsx`, reutilizado, no reinventado).

**Qué pasa al completar desde Calendario:** llama a la misma `completeItem(id)` del store descrita en la sección 6 — ninguna lógica de completado vive dentro de la pantalla de Calendario.

---

## 8. Lógica de recordatorios

**Recordatorio local:** usa la Notification API del navegador. Requiere `Notification.requestPermission()` una vez, disparado por una acción explícita del usuario (por ejemplo al crear el primer recordatorio), nunca automáticamente al abrir la app.

**Recordatorio crítico (`critical: true`):** misma notificación, pero se vuelve a disparar cada N minutos hasta que el usuario lo marca como visto/completado, en vez de una sola vez.

**Validación de minutos/horas/días:** en el formulario — `reminderDateTime` debe ser una fecha futura al momento de crear; `notifyBeforeMinutes` es un entero ≥ 0. Ambas validaciones son de formulario simple (no hace falta zod para dos reglas, aunque si el formulario crece se puede introducir después).

**Estados:** `pendiente` (todavía no llega su hora) → `completado` (usuario lo descartó/resolvió) → `vencido` (derivado, igual que en 4.2: pasó la hora y sigue sin completarse).

**Compatibilidad PWA — límite real que hay que conocer de entrada:** Safari en iOS soporta Web Push en apps instaladas ("Agregar a inicio") solo desde iOS 16.4, y aun así requiere: (a) un service worker registrado, (b) permiso de notificación concedido, y (c) para notificaciones disparadas por servidor, una suscripción push + un backend. Como este plan excluye backend por ahora, **la Fase 8 entrega notificaciones locales, no push real** — funcionan mientras la app está abierta o recién en segundo plano, no garantizadas si la app lleva rato cerrada en iOS. Vale la pena que lo sepas ahora para no esperar un comportamiento tipo WhatsApp de notificaciones que todavía no es parte del alcance.

**Qué se puede hacer sin backend:** notificaciones locales mientras la app está abierta/foreground o recién backgrounded; badges de conteo en la campana; banners dentro de la app (estos sí funcionan siempre, sin limitación de plataforma).

**Qué queda preparado para push real a futuro:** el modelo de datos (`reminderDateTime`, `critical`, `notifyBeforeMinutes`) ya tiene toda la forma que necesitaría un sistema de suscripción + cron en el backend, así que agregar push real más adelante es sumar infraestructura de servidor, no rediseñar el modelo de datos. El service worker que se registra en la Fase 8 se estructura para poder agregarle un listener de evento `push` después, sin reescribirlo.

---

## 9. Lógica de hábitos (Fase 1 sin IA)

**Crear hábito:** `title`, `repeatDays` (conjunto de días 0–6), `suggestedTime` opcional.

**Días de repetición:** array de números de día de semana. Un hábito "todos los días" es simplemente `[0,1,2,3,4,5,6]`, no un caso especial en el código.

**Racha actual / mejor racha:** funciones puras sobre `Habit.history`, no estado separado que se pueda desincronizar:

```ts
function calculateCurrentStreak(history: HabitHistoryEntry[]): number {
  // cuenta hacia atrás desde la entrada más reciente mientras sea 'completado' consecutivo
}
function calculateBestStreak(history: HabitHistoryEntry[]): number {
  // recorre todo el historial y guarda la racha consecutiva más larga encontrada
}
```
`currentStreak`/`bestStreak` en la interfaz se recalculan y cachean al leer, no se confía en mantenerlos "a mano" en cada mutación.

**Historial:** `Habit.history` es un array de `{ date, status }`. Un hábito es **un solo registro** en el store — sus ocurrencias diarias no son elementos `UzalaItem` separados, son entradas dentro de ese mismo registro. Esto es intencional: evita que "hacer ejercicio" genere 365 filas nuevas al año en el store.

**Completar / omitir hábito:** agrega una entrada a `history` con la fecha de hoy y `status: 'completado'` u `'omitido'`. Si ya existe una entrada para hoy, se actualiza en vez de duplicarse.

**Aparece en Inicio y Actividades cuando corresponde al día actual:** un hábito se incluye en `getToday()` solo si `repeatDays` incluye el día de la semana de hoy **y** no existe ya una entrada de `history` para la fecha de hoy (si ya se completó/omitió hoy, no vuelve a aparecer como pendiente).

**Aparece en Calendario:** proyección virtual descrita en la sección 7 — no genera filas nuevas por adelantado.

**Estructura para Hábitos Inteligentes Premium:** el campo `smartConfig?: null` en la interfaz `Habit` queda reservado y sin uso — ninguna lógica lo lee ni lo escribe todavía. Cuando llegue esa fase futura (fuera de las 8 fases de este documento), se define su forma real sin tener que migrar el esquema existente.

---

## 10. Lógica de "Por surtir"

**Crear elemento por surtir:** `title` (el producto/insumo), `quantity`/`unit` opcionales, `priority`, `dueDate` opcional, `supplierId` opcional.

**Marcar comprado/surtido:** reutiliza exactamente `completeItem(id)` del store (`status: 'completado'`, `completedAt: now()`) — no se crea un campo `purchasedAt` aparte, sería el mismo concepto con otro nombre.

**Prioridad:** mismo enum `Priority` de toda la app (`baja/media/alta`), mismos tokens de color — Por surtir no tiene su propio esquema de prioridad.

**Fecha límite:** `dueDate`, se trata igual que `scheduledDate` para efectos de `isOverdue()` y de aparecer en Calendario.

**Relación futura con proveedores:** el campo `supplierId` se define **ya**, en la Fase 1/4 del modelo de datos, aunque el CRUD de Proveedores no se construye hasta la Fase 7. Así, cuando llegue esa fase, es enlazar un selector — no una migración de esquema.

**Aparece en Inicio si es urgente:** usa la misma definición única de "urgente" de la sección 3.4 (`priority === 'alta'` OR `isOverdue()`) — no existe una segunda regla de "urgente" solo para Por surtir.

---

## 11. Lógica de proveedores

Campos: `name` (heredado de `title`), `phone`, `whatsapp` opcional, `products: string[]`, `notes` (heredado de `description`).

`whatsapp` se guarda normalizado en formato E.164 (ej. `+528441234567`), listo para un enlace `https://wa.me/<numero>` sin prefijo `+` — trivial de agregar como botón en la Fase 7 si quieres ese quick-win ("abrir WhatsApp" directo desde la ficha del proveedor).

Ninguno de los siguientes campos es una tabla nueva — todos son **vistas filtradas sobre `UzalaItem`**, reforzando la regla de fuente única de la sección 3:

- **Historial del proveedor** = todos los elementos (de cualquier tipo, principalmente `por_surtir` y `actividad`) donde `supplierId === provider.id`, sin filtrar por status, orden descendente por fecha.
- **Pendientes relacionados** = el mismo filtro, pero excluyendo `status === 'completado'`.
- **Próximas llamadas** = elementos de tipo `actividad`/`recordatorio` ligados a este proveedor con `scheduledDate` futura.

Ningún dato de proveedor se duplica en otra estructura — es el mismo `getByProvider(providerId)` mencionado en la sección 3.4, filtrado en el componente según lo que cada sub-sección necesita mostrar.

---

## 12. Plan de implementación por fases

Antes de la Fase 1, un paso único de limpieza (no es una fase, es higiene de repo):

**Paso 0 — Unificar gestor de paquetes.** Hoy conviven `pnpm-lock.yaml` y `package-lock.json`. Elegir uno (el que realmente uses día a día) y eliminar el otro con `git rm`. Sin esto, cualquier instalación futura puede quedar inconsistente entre tu máquina, OpenCode y Vercel.

### Fase 1 — Fuente de datos + conectar Home

**Objetivo:** crear la única fuente de verdad y conectar todo lo que ya existe visualmente en Home a datos reales. Ninguna pantalla nueva todavía.

**Archivos:**
`package.json` (+zustand) · `lib/types.ts` (nuevo) · `lib/storage.ts` (nuevo) · `lib/date-utils.ts` (nuevo) · `hooks/use-advanced-activities.ts` (nuevo) · `components/uzala/greeting-card.tsx` (editar) · `components/uzala/stat-cards.tsx` (editar) · `components/uzala/upcoming-list.tsx` (editar) · `components/uzala/home-header.tsx` (editar)

**Pasos:**
1. `npm install zustand`
2. Crear `lib/types.ts` con las interfaces de la sección 4 completas.
3. Crear `lib/storage.ts`: adaptador con `get()`/`set()` sobre una sola clave versionada de `localStorage` (ej. `uzala:v1:items`), serializando JSON. Ningún otro archivo llama a `localStorage` directamente.
4. Crear `lib/date-utils.ts`: `isOverdue`, `isToday`, `isSameDay`, `matchesWeekday`.
5. Crear `hooks/use-advanced-activities.ts`: store Zustand + `persist` middleware sobre `storage.ts`, exponiendo los selectors de la sección 3.4.
6. Conectar `greeting-card.tsx`: input controlado + toggle con estado real. El botón `+` crea un `Pendiente` genérico con el texto tal cual (sin clasificar todavía — eso es Fase 2), solo para validar el ducto de datos.
7. Conectar `stat-cards.tsx` a `getToday()`/`getUrgent()`.
8. Conectar `upcoming-list.tsx` a `getUpcoming()`, agregando el estado vacío.
9. Conectar el punto de la campana en `home-header.tsx` a `getUrgent().length > 0`.
10. Crear 3-4 elementos de prueba desde la propia UI para verificar visualmente que las tarjetas y la lista pintan datos reales.

**Criterios de aceptación:**
- Escribir texto en el input y presionar `+` crea un registro real, visible en `Application → Local Storage` del navegador.
- Recargar la página conserva los datos (persistencia real, no memoria).
- "Hoy" y "Urgentes" muestran números derivados de datos reales, nunca `"0"` hardcodeado.
- "Pendientes próximos" muestra los elementos reales, ordenados; con cero elementos, muestra el mensaje de estado vacío.
- El toggle Actividades/Pendientes cambia de estado visualmente y filtra la lista.
- `npx tsc --noEmit` sin errores.

**Comandos de validación:** `npx tsc --noEmit && npm run build && git status`

**Commit sugerido:** `feat(fase-1): fuente de datos central + Home conectado`

---

### Fase 2 — Botón `+` con Actividad, Pendiente y Recordatorio

**Objetivo:** activar el menú de creación con sus 7 opciones (3 funcionales, 4 con placeholder), y reemplazar la creación genérica de la Fase 1 por el parser heurístico real.

**Archivos:**
`lib/quick-capture-parser.ts` (nuevo) · `components/uzala/create-item-sheet.tsx` (nuevo) · `components/uzala/forms/activity-form.tsx`, `pendiente-form.tsx`, `reminder-form.tsx` (nuevos) · `components/uzala/bottom-nav.tsx` (editar: `onClick` del `+` central) · `components/uzala/greeting-card.tsx` (editar: usa el parser real) · posible `npx shadcn@latest add dialog sheet input textarea label select` para tener los primitivos de formulario

**Pasos:**
1. Instalar los componentes shadcn necesarios para formularios/hojas (hoy solo existe `button.tsx`).
2. Escribir `quick-capture-parser.ts` como una cascada de reglas deterministas (regex de hora → `actividad`/`recordatorio`; palabras clave "comprar/surtir/falta" → candidato `por_surtir`; palabras de recurrencia "todos los días/cada semana" → candidato `habito`; sin ninguna coincidencia → `pendiente`). El resultado siempre se muestra al usuario para confirmar/corregir antes de guardar — no se auto-clasifica en silencio.
3. Construir `create-item-sheet.tsx`: hoja con las 7 opciones; Hábito/Por surtir/Proveedor/Nota muestran "Disponible próximamente" hasta sus fases correspondientes.
4. Construir los 3 formularios reales (`activity-form`, `pendiente-form`, `reminder-form`), todos llamando a `addItem()` del store de la Fase 1.
5. Conectar el `+` central del bottom nav para abrir `create-item-sheet.tsx`.
6. Reemplazar la creación genérica de `greeting-card.tsx` por el flujo: parser → confirmación de tipo → `addItem()`.

**Criterios de aceptación:**
- El `+` central abre el menú con las 7 opciones visibles.
- Crear una Actividad, un Pendiente y un Recordatorio desde sus formularios los persiste correctamente con el `type` correcto.
- El input rápido de Home clasifica al menos los casos simples de "a las HH:MM" como actividad/recordatorio, y ofrece corrección manual del tipo detectado.
- `npx tsc --noEmit` sin errores.

**Comandos de validación:** `npx tsc --noEmit && npm run build && git status`

**Commit sugerido:** `feat(fase-2): menu de creacion + parser de captura rapida`

---

### Fase 3 — Unificar Actividades, Pendientes y Calendario

**Objetivo:** ruta `/calendario` real, vista "Actividades" completa (el toggle deja de ser solo una lista corta y se convierte en una vista filtrable completa), garantizando que todo con fecha aparece de forma consistente en las tres superficies desde los mismos selectors.

**Archivos:** `app/calendario/page.tsx` (nuevo) · `components/uzala/calendar-grid.tsx`, `day-detail-sheet.tsx` (nuevos) · `components/uzala/bottom-nav.tsx` (editar: `Link` a `/calendario`) · vista de Actividades expandida (puede vivir dentro de `app/page.tsx` como una sección que se expande, sin ruta nueva, según lo decidido en 5.3)

**Pasos:**
1. Construir la grilla de calendario (mes/semana) usando `glass` y los tokens de prioridad existentes, sin CSS nuevo fuera de layout de grilla.
2. Implementar la proyección virtual de hábitos por día (sección 7/9).
3. Implementar `day-detail-sheet.tsx` reutilizando el componente de fila que ya existe en `upcoming-list.tsx`.
4. Expandir la vista "Actividades" del toggle de Home para mostrar todo (no solo los próximos 3), con el mismo filtro `actividad`/`recordatorio`.
5. Conectar `Calendario` del bottom nav a la nueva ruta.

**Criterios de aceptación:**
- Crear un elemento con fecha lo hace aparecer en Calendario en el día correcto, sin código de filtrado nuevo por pantalla (todas llaman al mismo selector).
- Tocar un día abre el detalle con sus elementos.
- Completar desde Calendario usa `completeItem()` y se refleja instantáneamente en Home.

**Comandos de validación:** `npx tsc --noEmit && npm run build && git status`

**Commit sugerido:** `feat(fase-3): calendario + vista de actividades unificada`

---

### Fase 4 — Historial completo y colores por estado

**Objetivo:** ruta `/mas/historial`, agregar el único color nuevo necesario (`--status-success`), y aplicar colores de estado consistentes en Calendario y listas.

**Archivos:** `app/globals.css` (**única edición de color de todo el plan** — agregar una variable, no modificar ninguna existente) · `app/mas/historial/page.tsx` (nuevo)

**Pasos:**
1. Agregar en `:root` de `globals.css`: `--status-success: #22c55e;` (o el verde que prefieras — la única condición es que sea legible sobre el fondo turquesa oscuro y distinto del `--primary` para no confundirse con "activo/marca").
2. Construir la vista de Historial: selector sin filtro de status, orden descendente por `completedAt`/`createdAt`.
3. Aplicar `--status-success` en Calendario (días completados) y en badges de listas donde `status === 'completado'`.
4. Verificar que `--destructive` (ya existente) se usa consistentemente para vencidos en todas las pantallas, no solo en una.

**Criterios de aceptación:**
- Historial muestra absolutamente todo, completado o no, sin duplicar la lógica de otra pantalla.
- Completados se ven en verde en Calendario y listas.
- Vencidos se ven en rojo (`--destructive`) en Calendario y listas.
- Ningún otro valor de color en `globals.css` cambió.

**Comandos de validación:** `npx tsc --noEmit && npm run build && git status`

**Commit sugerido:** `feat(fase-4): historial + color de estado completado`

---

### Fase 5 — Módulo Hábitos básico

**Objetivo:** CRUD de hábitos según la sección 9, sin IA.

**Archivos:** `components/uzala/forms/habit-form.tsx` (nuevo) · `app/mas/habitos/page.tsx` (nuevo) · activar la opción "Hábito" en `create-item-sheet.tsx` (quitar su placeholder)

**Pasos:** crear/editar hábito, marcar completado/omitido del día, mostrar racha actual y mejor racha, listar historial, integrar en `getToday()` y en la proyección de Calendario ya construida en la Fase 3.

**Criterios de aceptación:** un hábito con `repeatDays` que incluye hoy aparece en Inicio; completarlo actualiza la racha correctamente; no aparece de nuevo hasta el próximo día que coincida.

**Comandos de validación:** `npx tsc --noEmit && npm run build && git status`

**Commit sugerido:** `feat(fase-5): modulo de habitos`

---

### Fase 6 — Módulo Por surtir

**Objetivo:** CRUD según sección 10.

**Archivos:** `components/uzala/forms/restock-form.tsx` (nuevo) · `app/mas/por-surtir/page.tsx` (nuevo) · activar "Por surtir" en `create-item-sheet.tsx`

**Pasos:** crear/editar, marcar comprado (reusa `completeItem`), mostrar `dueDate`, dejar `supplierId` listo para enlazar en la Fase 7.

**Criterios de aceptación:** un elemento con `priority: 'alta'` o vencido aparece en la tarjeta "Urgentes" de Home sin código nuevo de urgencia (usa el selector ya existente).

**Comandos de validación:** `npx tsc --noEmit && npm run build && git status`

**Commit sugerido:** `feat(fase-6): modulo por surtir`

---

### Fase 7 — Módulo Proveedores

**Objetivo:** CRUD según sección 11, enlazando `supplierId` de Por surtir.

**Archivos:** `components/uzala/forms/provider-form.tsx` (nuevo) · `app/mas/proveedores/page.tsx` (nuevo) · activar "Proveedor" en `create-item-sheet.tsx`

**Pasos:** crear/editar proveedor, ficha con historial/pendientes/próximas llamadas (todo vía `getByProvider()`), opcional botón "Abrir WhatsApp" con `wa.me/{whatsapp}`.

**Criterios de aceptación:** un "Por surtir" enlazado a un proveedor aparece en la ficha de ese proveedor sin necesitar una tabla nueva.

**Comandos de validación:** `npx tsc --noEmit && npm run build && git status`

**Commit sugerido:** `feat(fase-7): modulo de proveedores`

---

### Fase 8 — Notificaciones PWA locales

**Objetivo:** registrar service worker mínimo, notificaciones locales para recordatorios, dejar preparado (no implementado) el camino a push real.

**Archivos:** `public/sw.js` (nuevo) · registro del service worker en `app/layout.tsx` · lógica de disparo en `hooks/use-advanced-activities.ts` o un hook dedicado `hooks/use-reminders-notifier.ts`

**Pasos:** registrar service worker vacío/mínimo primero (desbloquea instalabilidad real); pedir permiso de notificación tras la primera creación de un recordatorio; comprobar recordatorios pendientes al abrir/enfocar la app y disparar `Notification` local para los que ya llegaron a su hora; repetir para los marcados `critical`.

**Criterios de aceptación:** una notificación local aparece cuando la app está abierta o recién en segundo plano y un recordatorio llega a su hora. Documentar explícitamente (no solo probar) que no hay push real con la app completamente cerrada — es una limitación de plataforma, no un bug de esta fase.

**Comandos de validación:** `npx tsc --noEmit && npm run build && git status`

**Commit sugerido:** `feat(fase-8): notificaciones locales pwa`

---

## 13. Criterios de aceptación (consolidado)

La app se considera funcional cuando, verificablemente:

- [ ] Crear actividad desde Home funciona y persiste.
- [ ] Crear pendiente desde `+` funciona y persiste.
- [ ] Crear recordatorio desde `+` funciona y persiste.
- [ ] Los elementos creados aparecen en Inicio cuando corresponde (hoy/urgente/próximo).
- [ ] Los elementos aparecen en Actividades cuando su tipo corresponde.
- [ ] Los elementos con fecha aparecen en Calendario en el día correcto.
- [ ] Completar un elemento lo oculta de todas las vistas "activas" a la vez (un solo selector, no una lista de exclusiones por pantalla).
- [ ] Completar manda el elemento a Historial, nunca lo borra.
- [ ] Completados se ven en verde (`--status-success`, único color nuevo de todo el plan).
- [ ] Vencidos se ven en rojo (`--destructive`, ya existente).
- [ ] Urgentes se ven destacados usando la misma definición de "urgente" en toda la app.
- [ ] No hay datos duplicados: un solo store, un solo adaptador de storage, cero `useState` paralelos con copias de listas.
- [ ] No hay pantallas ni botones decorativos sin función — cualquier elemento interactivo que quede sin lógica real debe decir explícitamente "Próximamente", no simular una acción que no pasa nada.

---

## 14. Comandos de validación

```bash
npx tsc --noEmit
npm run build
git status
```

Notas sobre estos tres comandos en este proyecto específico:

- **`npx tsc --noEmit` es el gate real de tipos.** `next.config.mjs` tiene `ignoreBuildErrors: true`, así que `npm run build` puede pasar en verde aunque haya errores de tipos — no asumir que un build exitoso implica cero errores de TypeScript. Considerar quitar esa bandera una vez que la Fase 1 esté estable.
- `npm run build` depende de descargar la fuente Outfit desde Google Fonts en tiempo de build (`next/font/google`); si alguna vez falla en un entorno con red restringida, no es necesariamente un error de la app.
- `git status` limpio (sin cambios sin commitear) antes de pasar a la siguiente fase — un commit por fase, no un commit gigante al final.

---

## 15. PROMPT PARA OPENCODE

```
Estás implementando UZALA siguiendo docs/UZALA_LOGICA_FUNCIONAL.md como única fuente de verdad.

Reglas estrictas, sin excepción:
- No rediseñar la UI. No cambiar colores existentes en app/globals.css (la única
  adición de color permitida en todo el plan es --status-success, y solo en la Fase 4).
- No cambiar el Home visual actual salvo las conexiones funcionales descritas
  en la sección 5 del documento.
- No implementar todo de golpe. Una fase a la vez, en el orden de la sección 12.
- Al terminar cada fase: correr `npx tsc --noEmit && npm run build`, confirmar
  que los criterios de aceptación de esa fase se cumplen, y solo entonces hacer
  commit con el mensaje sugerido en el documento.
- Después de cada fase, detente y espera confirmación antes de empezar la siguiente.
- No tocar Supabase todavía.
- No agregar login/autenticación todavía.
- No agregar IA todavía — el parser de captura rápida (Fase 2) es heurístico
  basado en reglas, no un modelo de lenguaje.
- Si algo en el código real no coincide con lo descrito en el diagnóstico
  (sección 1) porque el repo cambió desde el análisis, avisa antes de asumir
  y continuar.

Empieza por el Paso 0 (unificar gestor de paquetes) y luego la Fase 1.
```
