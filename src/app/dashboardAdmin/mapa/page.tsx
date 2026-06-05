"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useOrdersStream } from "@/lib/realtime/client";
import { Plus, Edit2, Check, X, Layers } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────── */
type ZoneType = "mesa" | "vip" | "barra" | "zona";

interface MapZone {
  id: string;
  label: string;
  type: ZoneType;
  col: number; // grid column (0-based)
  row: number; // grid row (0-based)
  colSpan: number;
  rowSpan: number;
  occupied: boolean;
}

interface Floor {
  id: string;
  name: string;
  zones: MapZone[];
}

interface ActiveOrder {
  id: string;
  order_number: number;
  order_type: string;
  status: string;
  table_number: number | null;
  customer_name: string | null;
  total: number;
}

/* ── Constants ──────────────────────────────────────────────────────────── */
const COLS = 10;
const ROWS = 8;
const ACTIVE_STATUSES = new Set(["recibido", "cocinando", "enviado"]);
const STORAGE_KEY = "restaurant_floor_layout";

const TYPE_LABELS: Record<ZoneType, string> = {
  mesa: "Mesa",
  vip: "VIP",
  barra: "Barra",
  zona: "Zona",
};

const TYPE_FREE: Record<ZoneType, string> = {
  mesa: "bg-gray-200 border-gray-300 text-gray-600",
  vip: "bg-gray-200 border-gray-300 text-gray-600",
  barra: "bg-gray-300 border-gray-400 text-gray-500",
  zona: "bg-gray-200 border-gray-300 text-gray-500",
};

const DEFAULT_FLOORS: Floor[] = [
  {
    id: "piso-1",
    name: "Piso 1",
    zones: [
      {
        id: "VIP 1",
        label: "VIP 1",
        type: "vip",
        col: 1,
        row: 0,
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "VIP 2",
        label: "VIP 2",
        type: "vip",
        col: 5,
        row: 0,
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "Mesa 4",
        label: "Mesa 4",
        type: "mesa",
        col: 1,
        row: 2,
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "Mesa 3",
        label: "Mesa 3",
        type: "mesa",
        col: 1,
        row: 3,
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "Mesa 2",
        label: "Mesa 2",
        type: "mesa",
        col: 1,
        row: 4,
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "Mesa 1",
        label: "Mesa 1",
        type: "mesa",
        col: 1,
        row: 5,
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "Mesa 5",
        label: "Mesa 5",
        type: "mesa",
        col: 5,
        row: 2,
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "Mesa 6",
        label: "Mesa 6",
        type: "mesa",
        col: 5,
        row: 3,
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "Mesa 7",
        label: "Mesa 7",
        type: "mesa",
        col: 5,
        row: 4,
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "Barra 1",
        label: "Barra 1",
        type: "barra",
        col: 0,
        row: 4,
        colSpan: 1,
        rowSpan: 2,
      },
      {
        id: "Barra 2",
        label: "Barra 2",
        type: "barra",
        col: 0,
        row: 2,
        colSpan: 1,
        rowSpan: 2,
      },
      {
        id: "Terraza",
        label: "Terraza",
        type: "zona",
        col: 5,
        row: 6,
        colSpan: 4,
        rowSpan: 2,
      },
    ],
  },
];

function loadLayout(): Floor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_FLOORS;
  } catch {
    return DEFAULT_FLOORS;
  }
}
function saveLayout(floors: Floor[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(floors));
}
function uid() {
  return Math.random().toString(36).slice(2, 8);
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function MapaPage() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [activeFloorId, setActiveFloorId] = useState("piso-1");
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<ActiveOrder | null>(null);
  const [renamingFloor, setRenamingFloor] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [addForm, setAddForm] = useState<{
    type: ZoneType;
    label: string;
  } | null>(null);
  // drag state
  const dragging = useRef<{
    zoneId: string;
    offsetCol: number;
    offsetRow: number;
  } | null>(null);

  useEffect(() => {
    setFloors(loadLayout());
  }, []);

  const fetchOrders = async () => {
    try {
      const { orders } = await api.get<{ orders: ActiveOrder[] }>(
        "/api/orders",
      );
      setOrders(orders.filter((o) => ACTIVE_STATUSES.has(o.status)));
    } catch {
      /* silent */
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);
  useOrdersStream(null, (e) => {
    if (e.type === "order.created" || e.type === "order.updated") fetchOrders();
    else if (e.type === "order.deleted" && e.orderId)
      setOrders((p) => p.filter((o) => o.id !== e.orderId));
  });

  const floor = floors.find((f) => f.id === activeFloorId) ?? floors[0];

  const tableOrders: Record<string, ActiveOrder> = {};
  for (const o of orders) {
    if (
      o.order_type === "mesa" &&
      o.status !== "entregado" &&
      o.table_number != null
    ) {
      tableOrders[o.table_number] = o;
    }
  }

  /* ── Mutators ─────────────────────────────────────────────────────────── */
  function updateFloors(next: Floor[]) {
    setFloors(next);
    saveLayout(next);
  }

  function moveZone(zoneId: string, col: number, row: number) {
    updateFloors(
      floors.map((f) =>
        f.id !== floor.id
          ? f
          : {
              ...f,
              zones: f.zones.map((z) =>
                z.id === zoneId ? { ...z, col, row } : z,
              ),
            },
      ),
    );
  }

  function deleteZone(zoneId: string) {
    updateFloors(
      floors.map((f) =>
        f.id !== floor.id
          ? f
          : { ...f, zones: f.zones.filter((z) => z.id !== zoneId) },
      ),
    );
  }

  async function addZone() {
    if (!addForm?.label.trim()) return;
    const isBarra = addForm.type === "barra";
    const zone: MapZone = {
      id: `${addForm.type}-${uid()}`,
      label: addForm.label.trim(),
      type: addForm.type,
      col: 0,
      row: 0,
      colSpan: isBarra ? 1 : 2,
      rowSpan: isBarra ? 2 : 1,
      occupied: false,
    };

    await api.post("/api/map/zones", zone);

    updateFloors(
      floors.map((f) =>
        f.id !== floor.id ? f : { ...f, zones: [...f.zones, zone] },
      ),
    );
    setAddForm(null);
  }

  function addFloor() {
    const id = `piso-${uid()}`;
    const newFloor: Floor = {
      id,
      name: `Piso ${floors.length + 1}`,
      zones: [],
    };
    const next = [...floors, newFloor];
    updateFloors(next);
    setActiveFloorId(id);
  }

  function deleteFloor(id: string) {
    if (floors.length === 1) return;
    const next = floors.filter((f) => f.id !== id);
    updateFloors(next);
    if (activeFloorId === id) setActiveFloorId(next[0].id);
  }

  function renameFloor(id: string, name: string) {
    updateFloors(floors.map((f) => (f.id === id ? { ...f, name } : f)));
    setRenamingFloor(null);
  }

  /* ── Drag handlers ────────────────────────────────────────────────────── */
  const cellRef = useRef<HTMLDivElement>(null);

  function getCell(clientX: number, clientY: number) {
    const grid = cellRef.current;
    if (!grid) return null;
    const rect = grid.getBoundingClientRect();
    const cellW = rect.width / COLS;
    const cellH = rect.height / ROWS;
    const col = Math.floor((clientX - rect.left) / cellW);
    const row = Math.floor((clientY - rect.top) / cellH);
    return {
      col: Math.max(0, Math.min(col, COLS - 1)),
      row: Math.max(0, Math.min(row, ROWS - 1)),
    };
  }

  function onDragStart(e: React.DragEvent, zone: MapZone) {
    if (!editMode) {
      e.preventDefault();
      return;
    }
    const cell = getCell(e.clientX, e.clientY);
    dragging.current = {
      zoneId: zone.id,
      offsetCol: cell ? cell.col - zone.col : 0,
      offsetRow: cell ? cell.row - zone.row : 0,
    };
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e: React.DragEvent) {
    if (!editMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function onDrop(e: React.DragEvent) {
    if (!editMode || !dragging.current) return;
    e.preventDefault();
    const cell = getCell(e.clientX, e.clientY);
    if (!cell) return;
    const col = Math.max(0, cell.col - dragging.current.offsetCol);
    const row = Math.max(0, cell.row - dragging.current.offsetRow);
    moveZone(dragging.current.zoneId, col, row);
    dragging.current = null;
  }

  const occupiedCount = Object.keys(tableOrders).length;
  const totalMesas = floor?.zones.filter((z) => z.type === "mesa").length ?? 0;

  if (!floor) return null;

  return (
    <div className="p-4 max-w-5xl mx-auto pb-28 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Mapa del restaurante
          </h1>
          <p className="text-sm text-gray-400">
            {occupiedCount} de {totalMesas} mesas ocupadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-sm bg-gray-300 border border-gray-400 inline-block" />{" "}
            Libre
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-sm bg-orange-400 inline-block rounded" />{" "}
            Ocupada
          </span>
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              editMode
                ? "bg-brand text-white shadow"
                : "bg-white border border-gray-200 text-gray-600 hover:shadow"
            }`}
          >
            <Edit2 size={14} />
            {editMode ? "Editando" : "Editar mapa"}
          </button>
        </div>
      </div>

      {/* Floor tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {floors.map((f) => (
          <div key={f.id} className="flex items-center gap-1">
            {renamingFloor === f.id ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") renameFloor(f.id, renameValue);
                    if (e.key === "Escape") setRenamingFloor(null);
                  }}
                  className="border border-brand rounded-lg px-2 py-1 text-sm w-28 outline-none"
                />
                <button
                  onClick={() => renameFloor(f.id, renameValue)}
                  className="p-1 text-green-600"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setRenamingFloor(null)}
                  className="p-1 text-gray-400"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveFloorId(f.id)}
                onDoubleClick={() => {
                  if (editMode) {
                    setRenamingFloor(f.id);
                    setRenameValue(f.name);
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  activeFloorId === f.id
                    ? "bg-gray-800 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Layers size={13} />
                {f.name}
              </button>
            )}
            {editMode && floors.length > 1 && (
              <button
                onClick={() => deleteFloor(f.id)}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        {editMode && (
          <button
            onClick={addFloor}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
          >
            <Plus size={14} /> Nuevo piso
          </button>
        )}
      </div>

      {/* Grid */}
      <div
        ref={cellRef}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="relative w-full bg-gray-50 border-2 border-gray-200 rounded-3xl overflow-hidden select-none"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          aspectRatio: `${COLS} / ${ROWS}`,
        }}
      >
        {/* Grid lines */}
        {editMode &&
          Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: COLS }).map((_, c) => (
              <div
                key={`${r}-${c}`}
                className="border border-dashed border-gray-200"
                style={{ gridColumn: `${c + 1}`, gridRow: `${r + 1}` }}
              />
            )),
          )}

        {/* Zones */}
        {floor.zones.map((zone) => {
          const order = tableOrders[zone.label];
          const occupied = !!order;

          return (
            <div
              key={zone.id}
              draggable={editMode}
              onDragStart={(e) => onDragStart(e, zone)}
              onClick={() => {
                if (!editMode && occupied)
                  setSelected(order === selected ? null : order);
              }}
              style={{
                gridColumn: `${zone.col + 1} / span ${zone.colSpan}`,
                gridRow: `${zone.row + 1} / span ${zone.rowSpan}`,
                zIndex: 10,
              }}
              className={`
               group
                  m-1 rounded-xl border-2 flex flex-col items-center justify-center relative
                transition-all duration-200
                ${
                  occupied
                    ? "bg-orange-400 border-orange-500 text-white shadow-md"
                    : TYPE_FREE[zone.type]
                }
                ${editMode ? "cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-brand/40" : occupied ? "cursor-pointer hover:brightness-110" : ""}
              `}
            >
              {occupied && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white/60 animate-pulse" />
              )}
              {editMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteZone(zone.id);
                  }}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-100 z-20 transition"
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                >
                  <X size={10} />
                </button>
              )}
              <span className="font-bold text-xs md:text-sm leading-tight text-center px-1">
                {zone.label}
              </span>
              {occupied && (
                <span className="text-[9px] md:text-[11px] opacity-90 mt-0.5">
                  #{order.order_number}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit toolbar */}
      {editMode && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          {addForm ? (
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tipo</label>
                <select
                  value={addForm.type}
                  onChange={(e) =>
                    setAddForm({ ...addForm, type: e.target.value as ZoneType })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                >
                  {(Object.keys(TYPE_LABELS) as ZoneType[]).map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Nombre
                </label>
                <input
                  autoFocus
                  value={addForm.label}
                  onChange={(e) =>
                    setAddForm({ ...addForm, label: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addZone();
                    if (e.key === "Escape") setAddForm(null);
                  }}
                  placeholder="Ej. Mesa 8"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/20 w-40"
                />
              </div>
              <button
                onClick={addZone}
                className="flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-xl text-sm font-semibold"
              >
                <Check size={14} /> Agregar
              </button>
              <button
                onClick={() => setAddForm(null)}
                className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-500"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-sm text-gray-500">
                Arrastra las mesas para reposicionarlas. Doble clic en el piso
                para renombrarlo.
              </p>
              <button
                onClick={() => setAddForm({ type: "mesa", label: "" })}
                className="flex items-center gap-1.5 bg-brand/10 text-brand px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand/20 transition"
              >
                <Plus size={14} /> Agregar elemento
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected order detail */}
      {selected && !editMode && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400">
                Mesa {selected.table_number}
              </p>
              <h3 className="text-lg font-bold text-gray-800">
                Pedido #{selected.order_number}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs px-3 py-1 rounded-full font-semibold bg-orange-100 text-orange-700">
                {selected.status}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                cerrar
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm mt-3">
            <span className="text-gray-500">
              {selected.customer_name ?? "Sin nombre"}
            </span>
            <span className="font-bold text-gray-800">
              ${Number(selected.total).toLocaleString("es-CO")}
            </span>
          </div>
        </div>
      )}

      {/* Active orders summary */}
      {orders.length > 0 && !editMode && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Mesas activas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {orders
              .filter(
                (o) => o.order_type === "mesa" && o.status !== "entregado",
              )
              .map((o) => (
                <div
                  key={o.id}
                  onClick={() => setSelected(o === selected ? null : o)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-700">
                      Mesa {o.table_number}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-orange-100 text-orange-700">
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    #{o.order_number} · {o.customer_name ?? "—"}
                  </p>
                  <p className="text-sm font-bold text-gray-800 mt-1">
                    ${Number(o.total).toLocaleString("es-CO")}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
