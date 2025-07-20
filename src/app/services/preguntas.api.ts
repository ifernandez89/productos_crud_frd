// app/services/preguntas.api.ts

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function hacerPregunta(pregunta:string, agente:boolean):Promise<string> {
  try {
    const res=await fetch(`${BACKEND_URL}/api/aichat/preguntar?agente=${agente}`, {
      method:"POST",
      headers: {
        "Content-Type":"application/json",
      },
      body:JSON.stringify({ pregunta }),
    });


    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Error en la API:", res.status, res.statusText, errorBody);
      throw new Error("No se pudo obtener una respuesta.");
    }

    const data = await res.json();
    return data.respuesta;
  } catch (error) {
    console.error("Error al hacer la pregunta:", error);
    throw new Error("Error de conexión con el backend.");
  }
}
