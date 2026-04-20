"use client";

import { createClient } from "../../lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/router";

const SignUpForm = () => {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  // ============ Schema ============
  const formSchema = z.object({
    name: z.string().min(4).max(20),
    email: z.string().email(),
    phone: z.string().min(7, "Número inválido").max(15, "Máximo 15 dígitos"),
  });

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // ============ Submit ============
  const onSubmit = async (values: FormData) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.from("clients").insert({
        name: values.name,
        email: values.email,
        phone: values.phone,
      });

      if (error) throw error;

      toast.success("Cliente guardado correctamente");
      router.push("/dashboard");
      reset();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1>Nuevo Cliente</h1>
          <p className="text-sm text-gray-400 mt-2">Registrate como cliente</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="text-sm text-gray-500">Nombre</label>
            <input
              {...register("name")}
              type="text"
              placeholder="Juan Pérez"
              disabled={isLoading}
              className="w-full mt-1 h-12 px-4 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-400 outline-none"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-500">Correo</label>
            <input
              {...register("email")}
              type="email"
              placeholder="correo@email.com"
              disabled={isLoading}
              className="w-full mt-1 h-12 px-4 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-400 outline-none"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* phone */}
          <div>
            <label className="text-sm text-gray-500">Teléfono</label>
            <input
              {...register("phone")}
              type="text"
              placeholder="3001234567"
              disabled={isLoading}
              className="w-full mt-1 h-12 px-4 rounded-xl bg-gray-100"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-orange-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 transition"
          >
            {isLoading && <LoaderCircle className="w-4 h-4 animate-spin" />}
            Crear cuenta
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Ya tienes cuenta?{" "}
          <span
            onClick={() => !isLoading}
            className="text-orange-500 font-semibold cursor-pointer"
          >
            Inicia sesión
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
