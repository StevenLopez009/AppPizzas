export interface Barrio {
  value: string;
  label: string;
  domicilio: number;
}

export const BARRIOS: Barrio[] = [
  { value: "prosperidad",   label: "Prosperidad",         domicilio: 4000 },
  { value: "parques",       label: "Parques",             domicilio: 6000 },
  { value: "opalo",         label: "Ópalo",               domicilio: 5000 },
  { value: "sociego",       label: "Sosiego",             domicilio: 3000 },
  { value: "otros",         label: "Otro barrio",         domicilio: 6000 },
];

export function getDomicilio(barrio: string): number {
  return BARRIOS.find((b) => b.value === barrio)?.domicilio ?? 0;
}
