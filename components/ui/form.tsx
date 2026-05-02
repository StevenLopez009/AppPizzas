"use client";

import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type ControllerProps,
} from "react-hook-form";

import { cn } from "@/lib/utils";

export const Form = FormProvider;

type FormFieldContextValue = {
  name: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
));

FormItem.displayName = "FormItem";

export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
});

FormLabel.displayName = "FormLabel";

export const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  return <div ref={ref} {...props} />;
});

FormControl.displayName = "FormControl";

export function FormMessage() {
  const { formState } = useFormContext();
  const fieldContext = React.useContext(FormFieldContext);

  const error = formState.errors[fieldContext.name];

  if (!error) return null;

  return <p className="text-sm text-red-500">{error.message as string}</p>;
}
