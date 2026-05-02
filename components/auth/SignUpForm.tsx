"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { AuthFormProps } from "./AuthForm";

const SignUpForm = (_: Partial<AuthFormProps>) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    name: z.string().min(4).max(40),
    email: z.string().email(),
    phone: z.string().min(7, "Número inválido").max(15, "Máximo 15 dígitos"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
  });

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    try {
      await api.post("/api/auth/signup", values);
      // Guarda registro de cliente "público" también (compatibilidad con la tabla clients).
      try {
        await api.post("/api/clients", {
          name: values.name,
          email: values.email,
          phone: values.phone,
        });
      } catch {
        // best-effort
      }
      toast.success("Cuenta creada");
      router.push("/dashboard");
      router.refresh();
      reset();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Error al guardar";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 md:p-8">
        <div className="text-center mb-6">
          <h1>Nuevo Cliente</h1>
          <p className="text-sm text-gray-400 mt-2">Registrate como cliente</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div>
            <label className="text-sm text-gray-500">Contraseña</label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••"
              disabled={isLoading}
              className="w-full mt-1 h-12 px-4 rounded-xl bg-gray-100"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-orange-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 transition"
          >
            {isLoading && <LoaderCircle className="w-4 h-4 animate-spin" />}
            Crear cuenta
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
