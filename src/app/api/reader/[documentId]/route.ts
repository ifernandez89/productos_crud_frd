import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [
    { documentId: "1" },
    { documentId: "default" },
  ];
}

export async function GET(
  request: Request,
  props: { params: Promise<{ documentId: string }> }
) {
  try {
    const params = await props.params;
    const documentId = decodeURIComponent(params.documentId || "1");

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
    let documentData = null;

    // Intentar consultar al backend si se ejecuta en tiempo de ejecución
    try {
      const res = await fetch(`${backendUrl}/api/jarbees/library/document/${encodeURIComponent(documentId)}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (res.ok) {
        documentData = await res.json();
      }
    } catch {
      // Backend no disponible en build time, continúa con fallback formateado
    }

    const title = documentData?.title || documentData?.titulo || documentId;
    const author = documentData?.author || documentData?.autor || "Autor Desconocido";
    const paginas = documentData?.pages || documentData?.paginas || 180;

    let blocks: string[] = [];
    if (documentData?.content && Array.isArray(documentData.content)) {
      blocks = documentData.content;
    } else if (documentData?.text) {
      blocks = documentData.text.match(/[^.!?]+[.!?]+/g) || [documentData.text];
    } else {
      blocks = [
        `Capítulo 1 de ${title}. Bienvenido a la lectura mediante el módulo de audiolibro de JarBees.`,
        `Obra de ${author}. El texto extraído de la biblioteca se procesa progresivamente en bloques de síntesis de voz.`,
        `Mientras escuchas este fragmento, JarBees continúa generando en segundo plano los siguientes bloques con el modelo sematre/orpheus:it_es-3b.`,
        `Puedes bloquear la pantalla de tu dispositivo y el reproductor continuará emitiendo el audiolibro sin interrupciones.`,
      ];
    }

    return NextResponse.json({
      success: true,
      documentId,
      title,
      author,
      paginas,
      blocks,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
