export type ZoneType = "mesa" | "vip" | "barra" | "zona";

export interface MapZone {
  id: string;
  label: string;
  type: ZoneType;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

export interface Floor {
  id: string;
  name: string;
  zones: MapZone[];
}

const STORAGE_KEY = "restaurant_floor_layout";

export function getLayout(): Floor[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSelectableZones() {
  const floors = getLayout();

  return floors.flatMap((floor) =>
    floor.zones.filter(
      (z) => z.type === "mesa" || z.type === "barra" || z.type === "vip",
    ),
  );
}
