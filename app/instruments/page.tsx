import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function InstrumentsData() {
  const supabase = await createClient();
  // Hacemos la consulta a la tabla que creamos en el paso 1
  const { data: instruments } = await supabase.from("instruments").select();

  return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
}

export default function Instruments() {
  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Lista de Instrumentos</h1>
      <Suspense fallback={<div>Cargando...</div>}>
        <InstrumentsData />
      </Suspense>
    </main>
  );
}
