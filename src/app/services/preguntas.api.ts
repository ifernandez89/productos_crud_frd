// app/services/preguntas.api.ts

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function hacerPregunta(pregunta: string, agente: boolean): Promise<string> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/aichat/preguntar?agente=${agente}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pregunta }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Error en la API:${errorBody}`);
    }

    const data = await res.json();
    return data.respuesta;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Ocurrió un error desconocido.");
    }
  }
}
