"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { hacerPregunta } from "../../app/services/preguntas.api";

const LoadingSVG = () => (
  <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="25"
      cy="25"
      r="20"
      stroke="#000"
      strokeWidth="3"
      fill="none"
      strokeDasharray="31.415, 31.415"
      strokeDashoffset="0"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 25 25"
        to="360 25 25"
        dur="1s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

type HistorialItem = {
  pregunta: string;
  respuesta: string;
  tiempoRespuesta: number; // en segundos
};

export default function ChatAgent() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [tiempo, setTiempo] = useState(0);
  const tiempoRef = useRef(0);
  const intervaloRef = useRef<NodeJS.Timeout | null>(null);

 const preguntasFrecuentes = [
  "Resume en 3 oraciones la historia y características principales de París, capital de Francia.",
  "Explica en pocas frases cómo funciona una red neuronal, de forma simple.",
  "Describe en forma concisa qué es la teoría de la relatividad y por qué es importante.",
  "¿Cómo se trata el resfriado común? Resume los pasos básicos.",
  "Crea una guía breve para comenzar a programar en TypeScript, orientada a principiantes.",
  "En pocas frases: ¿cuál es la diferencia entre inteligencia artificial y aprendizaje automático?",
  "Resume los eventos clave y causas principales de la Revolución Francesa.",
  "Enumera los principales beneficios de dormir al menos 8 horas por noche.",
  "Explica de manera simple cómo se forma un arcoíris, en pocas frases.",
  "Resume el proceso de fotosíntesis en lenguaje claro y sencillo."
];

  const iniciarContador = () => {
    setTiempo(0);
    tiempoRef.current = 0;
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    intervaloRef.current = setInterval(() => {
      tiempoRef.current += 1;
      setTiempo(tiempoRef.current);
    }, 1000);
  };

  const detenerContador = () => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  };

  useEffect(() => {
    return () => detenerContador(); // cleanup
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    iniciarContador();
    try {
      const respuesta = await hacerPregunta(data.pregunta, true);
      const tiempoFinal = tiempoRef.current;
      detenerContador();
      setHistorial((prev) => [
        ...prev,
        {
          pregunta: data.pregunta,
          respuesta,
          tiempoRespuesta: tiempoFinal,
        },
      ]);
    } catch (error) {
      const mensajeError = error instanceof Error ? error.message : "No se pudo obtener la respuesta del agente.";
      const tiempoFinal = tiempoRef.current;
      detenerContador();
      setHistorial((prev) => [
        ...prev,
        {
          pregunta: data.pregunta,
          respuesta: `⚠️ Error: ${mensajeError}`,
          tiempoRespuesta: tiempoFinal,
        },
      ]);
    } finally {
      setLoading(false);
      reset();
    }
  });

  const formatTiempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min > 0 ? `${min}m ` : ""}${sec}s`;
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <div className="w-1/2 p-4 border-r border-gray-300">
        <Card className="h-full shadow-xl border-2 border-gray-500 bg-gray-100 text-black">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Consultá al Agente IA</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <textarea
                placeholder="Escribí tu texto, pregunta o tema a resumir..."
                {...register("pregunta", { required: true })}
                className="min-h-[120px] text-sm border border-gray-300 rounded p-2 w-full resize-none bg-gray-100 text-black"
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {loading ? "Consultando..." : "Consultar al Agente"}
              </Button>
            </form>
            <div className="mt-4">
              <CardTitle className="text-lg font-bold">Preguntas Frecuentes</CardTitle>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {preguntasFrecuentes.map((pregunta, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => reset({ pregunta })}
                    className="text-left w-full p-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    {pregunta}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="w-1/2 p-4 overflow-y-auto">
        <Card className="h-full shadow-xl border-2 border-gray-500 bg-gray-100 text-black">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="text-lg font-bold">Historial de Interacción</CardTitle>
            {loading && (
              <div className="text-sm text-gray-600">
                ⏱️ Tiempo transcurrido: {formatTiempo(tiempo)}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="flex flex-col items-center justify-center">
                <LoadingSVG />
                <p className="mt-2 text-gray-600">Cargando respuesta...</p>
              </div>
            )}
            {!loading && historial.length === 0 && (
              <p className="text-gray-600">Las respuestas del agente aparecerán aquí.</p>
            )}
            {!loading &&
              historial.map((item, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-gray-300">
                  <p className="font-semibold mb-1">🧾 Pregunta:</p>
                  <p className="mb-2 text-gray-800">{item.pregunta}</p>
                  <p className="font-semibold mb-1">💡 Respuesta:</p>
                  <p className="text-gray-800">{item.respuesta}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    ⏱️ Tiempo de respuesta: {formatTiempo(item.tiempoRespuesta)}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
