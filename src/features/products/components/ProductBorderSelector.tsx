interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ProductBorderSelector({ value, onChange }: Props) {
  return (
    <div className="mb-5">
      <h3 className="font-bold text-fg mb-3">Bordes de la Pizza</h3>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line rounded-2xl p-3 bg-surface-muted text-fg outline-none focus:ring-2 focus:ring-brand-ring"
      >
        <option value="">---</option>
        <option value="queso">Queso Crema</option>
        <option value="arequipe">Arequipe</option>
        <option value="bocadillo">Bocadillo</option>
        <option value="chocolate">Chocolate</option>
        <option value="chocolate blanco">Chocolate Blanco</option>
        <option value="fresa">Fresa</option>
        <option value="frutos amarillos">Frutos Amarillos</option>
        <option value="frutos rojos">Frutos Rojos</option>
        <option value="melocoton">Melocotón</option>
        <option value="mora">Mora</option>
        <option value="nucita">Nucita</option>
        <option value="nutela">Nutella</option>
      </select>
    </div>
  );
}
