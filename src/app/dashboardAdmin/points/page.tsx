import { Metadata } from "next";
import { UsersPointsTable } from "@/features/admin/components/UsersPointsTable";

export const metadata: Metadata = {
  title: "Gestión de Puntos - Admin",
};

export default function PointsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-fg mb-2">Gestión de Puntos</h1>
        <p className="text-fg-muted">
          Visualiza y gestiona los puntos acumulados por los usuarios
        </p>
      </div>

      <UsersPointsTable />

      <div className="bg-surface-muted rounded-2xl border border-line p-6">
        <h2 className="text-lg font-semibold text-fg mb-4">Sistema de Puntos</h2>
        <ul className="space-y-3 text-sm text-fg-muted">
          <li className="flex items-start gap-3">
            <span className="text-brand font-bold">•</span>
            Los usuarios ganan <strong>1 punto por cada $100</strong> de compra
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand font-bold">•</span>
            Los puntos se acumulan automáticamente al crear un pedido
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand font-bold">•</span>
            Puedes editar los puntos haciendo clic en el número de puntos
          </li>
          <li className="flex items-start gap-3">
            <span className="text-brand font-bold">•</span>
            Usa el botón de papelera para eliminar todos los puntos (canje)
          </li>
        </ul>
      </div>
    </div>
  );
}
