import { getBaseUrl } from "./jarbees.api";

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

const buildHeaders = (hasJson = false) => {
  const headers: Record<string, string> = {};
  if (hasJson) headers["Content-Type"] = "application/json";
  if (API_TOKEN) headers["Authorization"] = `Bearer ${API_TOKEN}`;
  return headers;
};

export async function getProducts() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/products`, {
      method: "GET",
      cache: "no-store",
      headers: buildHeaders(false),
    });

    if (!res.ok) {
      console.error("Error al obtener productos:", res.status, res.statusText);
      return []; // retornar un array vacío para evitar que falle el map()
    }
    return await res.json();
  } catch (error) {
    console.log("Error al hacer fetch de productos:", error);
    console.error("Error al hacer fetch de productos:", error);
    return []; // evitar que falle si hay error de red
  }
}

export async function getProduct(id: string) {
  const data = await fetch(`${getBaseUrl()}/api/products/${id}`, {
    method: "GET",
    cache: "no-store",
    headers: buildHeaders(false),
  });
  return await data.json(); //debe esperar hasta que se resuelva la respuesta antes de retornarla
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProduct(productData: any) {
  const res = await fetch(`${getBaseUrl()}/api/products`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al crear el producto');
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProduct(id: string, newProduct: any) {
  const res = await fetch(`${getBaseUrl()}/api/products/${id}`, {
    method: "PATCH",
    headers: buildHeaders(true),
    body: JSON.stringify(newProduct),
    cache: "no-store",
  });
  return await res.json(); //debe esperar que se resuelva antes de retornarla
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/products/${id}`, {
    method: "DELETE",
    headers: buildHeaders(false),
  });
  return await res.json(); //debe esperar que se resuelva antes de retornarla
}
