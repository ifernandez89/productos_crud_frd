"use client";

import React from "react";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";
import { UseFormRegister } from "react-hook-form";
import { Label } from "../ui/label";

export default function ProductFormPresentational({
  register,
  onSubmit,
  isEditing,
}: Readonly<{
  register: UseFormRegister<any>;
  onSubmit: () => void;
  isEditing: boolean;
}>) {
  return (
    <form onSubmit={onSubmit} className="max-w-xl mx-auto space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="block mb-1 font-medium">Nombre</Label>
          <input
            placeholder="Nombre"
            {...register("name")}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <Label className="block mb-1 font-medium">Marca</Label>
          <textarea
            placeholder="Marca"
            {...register("marca")}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <Label className="block mb-1 font-medium">Descripción</Label>
          <textarea
            placeholder="Descripción"
            {...register("description")}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <Label className="block mb-1 font-medium">Precio</Label>
          <input
            placeholder="Precio"
            type="number"
            {...register("price", { valueAsNumber: true })}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <Label className="block mb-1 font-medium">URL de Imagen</Label>
          <input
            placeholder="URL de Imagen"
            {...register("image")}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <Label className="block mb-1 font-medium">Stock</Label>
          <input
            placeholder="Stock"
            type="number"
            {...register("stock", { valueAsNumber: true })}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" {...register("isFeatured")} id="isFeatured" />
          <Label htmlFor="isFeatured" className="font-medium">
            Destacado
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" {...register("isOnSale")} id="isOnSale" />
          <Label htmlFor="isOnSale" className="font-medium">
            En Oferta
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" {...register("isNew")} id="isNew" />
          <Label htmlFor="isNew" className="font-medium">
            Es Nuevo
          </Label>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button type="submit">
          {isEditing ? "Actualizar Producto" : "Crear Producto"}
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Volver
        </Link>
      </div>
    </form>
  );
}
