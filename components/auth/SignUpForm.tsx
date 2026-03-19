"use client";
import { createClient } from "../../lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { AuthFormProps } from "./AuthForm";

const SignUpForm = ({ setTypeSelected }: AuthFormProps) => {
  const supabase = createClient();
  const [isLoading, setisLoading] = useState<boolean>(false);

  // ============ Form ============
  const formSchema = z.object({
    name: z
      .string()
      .min(4, "El nombre debe tener al menos 4 caracteres")
      .max(20, "El nombre no puede tener más de 20 caracteres")
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        "El nombre solo puede contener letras",
      ),

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
      name: "",
      email: "",
      password: "",
    },
  });

  const { handleSubmit, formState, control } = form;
  const { errors } = formState;

  // ============ Sign Up ===========
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setisLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success("¡Cuenta creada! Revisa tu correo de confirmación.");
        // Si quieres mandarlo al login automáticamente:
        // setTypeSelected('sign-in');
      }
    } catch (error: any) {
      // Tu manejo de errores (que ya estaba muy bien)
      toast.error(error.message || "Ocurrió un error en el registro");
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div>
      <div className="w-full backdrop-blur-xl rounded-4xl pb-4">
        <div className="text-center">
          <h1 className="lg:text-5xl md:text-4xl text-3xl font-semibold text-center my-4">
            Crear Cuenta
          </h1>

          <p className="text-sm text-muted-foreground mb-8">
            Crea una cuenta para acceder a todo el contenido
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="mx-4">
            <div className="grid gap-2">
              {/* ========== Name ========= */}
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mb-3">
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="name"
                        placeholder="John"
                        type="text"
                        autoComplete="name"
                        maxLength={20}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ========== Email ========= */}
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mb-3">
                    <FormLabel>Correo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        autoComplete="email"
                        maxLength={50}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ========== Password ========= */}
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mb-3">
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="password"
                        placeholder="*****"
                        type="password"
                        maxLength={50}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ========== Submit ========= */}
              <Button className="mt-6" type="submit" disabled={isLoading}>
                {isLoading && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                Crear cuenta
              </Button>
            </div>
          </form>
        </Form>

        {/* ========== Sign In ========= */}
        <p className="text-center text-sm mt-6 text-white">
          ¿Ya tienes una cuenta?{" "}
          <span
            onClick={() => !isLoading && setTypeSelected("sign-in")}
            className="underline underline-offset-4 hover:text-primary cursor-pointer"
          >
            Inicia Sesión
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
