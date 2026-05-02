interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ProductBorderSelector({ value, onChange }: Props) {
  return (
    <div className="mb-5">
      <h3 className="font-bold text-gray-800 mb-3">Bordes de la Pizza</h3>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-2xl p-3 bg-gray-50 outline-none"
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
