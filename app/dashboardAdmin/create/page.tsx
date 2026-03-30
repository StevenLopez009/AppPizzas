import CreateProductForm from "@/components/createProductForm/CreateProductForm";

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      <p>Creacion de Productos</p>
      <CreateProductForm />
    </div>
  );
}
