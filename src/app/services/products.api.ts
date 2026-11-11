//funciones que piden al backend
import {
  buildBackendHeaders,
  handleUnauthorizedResponse,
  resolveBackendBaseUrl,
} from "./auth.api";

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const getBaseUrl = () => resolveBackendBaseUrl();

const buildHeaders = (hasJson = false, targetUrl?: string) =>
  buildBackendHeaders({ json: hasJson, accept: true, targetUrl });

export async function getProducts() {
  try {
    const url = `${getBaseUrl()}/api/products`;
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: buildHeaders(false, url),
    });

    if (!res.ok) {
      handleUnauthorizedResponse(res);
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
  const url = `${getBaseUrl()}/api/products/${id}`;
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: buildHeaders(false, url),
  });
  if (!res.ok) handleUnauthorizedResponse(res);
  return await res.json(); //debe esperar hasta que se resuelva la respuesta antes de retornarla
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProduct(productData: any) {
  const url = `${getBaseUrl()}/api/products`;
  const res = await fetch(url, {
    method: "POST",
    headers: buildHeaders(true, url),
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) {
    handleUnauthorizedResponse(res);
    throw new Error(data.message || 'Error al crear el producto');
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProduct(id: string, newProduct: any) {
  const url = `${getBaseUrl()}/api/products/${id}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: buildHeaders(true, url),
    body: JSON.stringify(newProduct),
    cache: "no-store",
  });
  if (!res.ok) handleUnauthorizedResponse(res);
  return await res.json(); //debe esperar que se resuelva antes de retornarla
}

export async function deleteProduct(id: string) {
  const url = `${getBaseUrl()}/api/products/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: buildHeaders(false, url),
  });
  if (!res.ok) handleUnauthorizedResponse(res);
  return await res.json(); //debe esperar que se resuelva antes de retornarla
}
