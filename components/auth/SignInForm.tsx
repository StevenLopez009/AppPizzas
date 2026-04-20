"use client";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { AuthFormProps } from "./AuthForm";
import { Input } from "../ui/input";
import ImgLogin from "@/assets/images/loginImg.jpg";
import { ro } from "date-fns/locale";
import { Sign } from "node:crypto";
import SignUpForm from "./SignUpForm";
import Link from "next/link";

const SignInForm = ({ setTypeSelected }: AuthFormProps) => {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setisLoading] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  const formSchema = z.object({
    email: z
      .email("Por favor ingresa un correo válido. Ejemplo: user@mail.com")
      .min(1, {
        message: "Este campo es requerido",
      }),
    password: z.string().min(6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, formState, control } = form;
  const { errors } = formState;

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setisLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast.success("¡Bienvenido!");

      const USER_EMAIL = authData.user?.email;
      if (USER_EMAIL?.toLowerCase() === ADMIN_EMAIL?.toLowerCase()) {
        router.replace("/dashboardAdmin");
      } else {
        router.replace("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setisLoading(false);
    }
  };

  const handleRegister = () => {
    setIsRegistering(true);
  };

  if (isRegistering) {
    return <SignUpForm setTypeSelected={setTypeSelected} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md md:max-w-4xl bg-white shadow-2xl rounded-[30px] overflow-hidden md:flex">
        {/* Imagen */}
        <div
          className="relative h-56 md:h-auto md:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: `url(${ImgLogin.src})` }}
        >
          <Link
            href="/dashboard"
            className="absolute top-4 left-4 text-white text-sm flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full backdrop-blur"
          >
            ← Back
          </Link>
        </div>

        {/* Formulario */}
        <div className="w-full md:w-1/2 p-6 md:p-10">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-orange-600">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-400 mt-2">Accede para continuar</p>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500 text-sm">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your email"
                        className="h-12 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500 text-sm">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter password"
                        className="h-12 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-blue-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                className="w-full h-12 bg-orange-500 text-white rounded-xl font-semibold shadow-md hover:bg-orange-600 transition"
              >
                {isLoading ? "Cargando..." : "Ingresar"}
              </button>
            </form>
          </Form>

          <p className="text-center text-sm text-gray-400 mt-6">
            ¿No tienes cuenta?{" "}
            <span
              onClick={handleRegister}
              className="text-orange-500 font-semibold cursor-pointer"
            >
              Regístrate
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
