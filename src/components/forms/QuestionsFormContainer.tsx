"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { hacerPregunta } from "../../app/services/preguntas.api";

const LoadingSVG = () => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 50 50"
    xmlns="http://www.w3.org/2000/svg"
  >
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

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: ((event: Event) => void) | null;
};

type SpeechRecognitionResultLike = {
  0: {
    transcript: string;
  };
  length: number;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorLike = {
  error: string;
};

export default function ChatAgent() {
  const { register, handleSubmit, reset, setValue, getValues } = useForm();
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [tiempo, setTiempo] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceInputSupported, setVoiceInputSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const tiempoRef = useRef(0);
  const intervaloRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldAutoSubmitRef = useRef(false);
  const voiceBaseRef = useRef("");

  const preguntasFrecuentes = [
    "¿Qué modelos de celulares tienes disponibles actualmente en stock?",
    "¿Cuáles son los celulares más económicos que ofrecen y qué características incluyen?",
    "¿Qué modelos tienen mayor capacidad de RAM y almacenamiento interno?",
    "¿Cuáles son los celulares más caros que manejan y qué los diferencia de otros?",
    "¿Qué opciones hay para comprar un celular con plan de financiamiento o cuotas?",
    "¿Ofrecen garantía en los celulares? ¿Cuánto tiempo dura y qué cubre?",
    "¿Qué marcas de celulares tienen mejor relación calidad-precio en este momento?",
    "¿Cuáles son los celulares con mejor cámara según las especificaciones técnicas?",
    "¿Tienen celulares reacondicionados o usados? ¿Qué garantía ofrecen en esos casos?",
    "¿Qué accesorios (fundas, cargadores, audífonos) incluyen al comprar un celular nuevo?",
    "¿Cómo puedo comparar las especificaciones técnicas entre dos modelos específicos?",
    "¿Qué celulares son los más recomendados para gaming o uso intensivo?",
    "¿Ofrecen servicio técnico o soporte postventa para los celulares que venden?",
    "¿Cuáles son los celulares con mayor duración de batería según las pruebas?",
    "¿Tienen opciones de celulares resistentes al agua o golpes?",
    "¿Qué promociones o descuentos están vigentes en la compra de celulares esta semana?",
    "¿Puedo cambiar mi celular usado por uno nuevo? ¿Cómo funciona el programa de canje?",
    "¿Qué celulares son compatibles con redes 5G en la zona?",
    "¿Cuáles son los celulares más vendidos en los últimos meses?",
    "¿Cómo puedo saber si un celular es original o una copia al momento de comprarlo?",
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
    setSpeechSupported(
      typeof window !== "undefined" && "speechSynthesis" in window,
    );

    const browserWindow = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };

    setVoiceInputSupported(
      Boolean(browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition),
    );

    const storedPreference = window.localStorage.getItem("chat-agent-audio");
    if (storedPreference !== null) {
      setAudioEnabled(storedPreference === "true");
    }

    return () => detenerContador(); // cleanup
  }, []);

  useEffect(() => {
    window.localStorage.setItem("chat-agent-audio", String(audioEnabled));
  }, [audioEnabled]);

  useEffect(() => {
    if (!audioEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [audioEnabled]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      detenerContador();
    };
  }, []);

  const reproducirAudio = (texto: string) => {
    if (!audioEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "es-ES";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const detenerAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const iniciarEntradaPorVoz = () => {
    if (loading || !voiceInputSupported || isListening) {
      return;
    }

    const browserWindow = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };

    const SpeechRecognitionConstructor =
      browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setVoiceMessage("Este navegador no soporta dictado por voz.");
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = "es-ES";
    recognition.interimResults = true;
    recognition.continuous = false;

    voiceBaseRef.current = getValues("pregunta")?.trim() ?? "";
    shouldAutoSubmitRef.current = true;
    setVoiceMessage("Escuchando... hablá tu pregunta y se enviará al terminar.");

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("")
        .trim();

      const nextValue = voiceBaseRef.current
        ? `${voiceBaseRef.current} ${transcript}`.trim()
        : transcript;

      setValue("pregunta", nextValue, {
        shouldDirty: true,
        shouldTouch: true,
      });
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      shouldAutoSubmitRef.current = false;
      setVoiceMessage(
        event.error === "not-allowed"
          ? "Necesitás permitir el micrófono para usar dictado por voz."
          : "No se pudo reconocer el audio. Intentá de nuevo.",
      );
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;

      if (!shouldAutoSubmitRef.current) {
        return;
      }

      shouldAutoSubmitRef.current = false;
      const preguntaDictada = getValues("pregunta")?.trim();
      if (preguntaDictada) {
        setVoiceMessage("Pregunta dictada. Enviando...");
        void submitQuestion();
      } else {
        setVoiceMessage("No se detectó texto suficiente para enviar.");
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      shouldAutoSubmitRef.current = false;
      setVoiceMessage("No se pudo iniciar el dictado por voz.");
    }
  };

  const detenerEntradaPorVoz = () => {
    shouldAutoSubmitRef.current = true;
    recognitionRef.current?.stop();
  };

  const submitQuestion = handleSubmit(async (data) => {
    setLoading(true);
    iniciarContador();
    try {
      const respuesta = await hacerPregunta(data.pregunta, true);
      const tiempoFinal = tiempoRef.current;
      detenerContador();
      reproducirAudio(respuesta);
      setHistorial((prev) => [
        ...prev,
        {
          pregunta: data.pregunta,
          respuesta,
          tiempoRespuesta: tiempoFinal,
        },
      ]);
    } catch (error) {
      const mensajeError =
        error instanceof Error
          ? error.message
          : "No se pudo obtener la respuesta del agente.";
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
      setVoiceMessage("");
    }
  });

  const formatTiempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min > 0 ? `${min}m ` : ""}${sec}s`;
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-[#1F2937]">
      <div className="w-1/2 p-4 border-r border-gray-300">
        <Card className="h-full shadow-md border border-[#D1D5DB] bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              ¿En qué puedo ayudarte?
            </CardTitle>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
              <div>
                <p className="font-semibold text-gray-800">Modo de respuesta</p>
                <p className="text-gray-600">
                  {speechSupported
                    ? "Audio activado por defecto, con opción de dejarlo en solo texto."
                    : "Este navegador no soporta audio; las respuestas se mostrarán solo en texto."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {audioEnabled && speechSupported && (
                  <button
                    type="button"
                    onClick={detenerAudio}
                    className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    Detener audio
                  </button>
                )}
                <div className="flex rounded-full border border-gray-300 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setAudioEnabled(true)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    audioEnabled && speechSupported
                      ? "bg-[#2563EB] text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  disabled={!speechSupported}
                >
                  Audio
                </button>
                <button
                  type="button"
                  onClick={() => setAudioEnabled(false)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    !audioEnabled
                      ? "bg-[#2563EB] text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Solo texto
                </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitQuestion} className="space-y-4">
              <div className="space-y-3">
                <textarea
                  placeholder="Escribí tu texto, pregunta o tema a resumir..."
                  {...register("pregunta", { required: true })}
                  className="min-h-[120px] text-sm border border-gray-300 rounded p-2 w-full resize-none bg-gray-100 text-black"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 text-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-2 px-4 rounded"
                  >
                    {loading ? "Consultando..." : "Consultar al Agente"}
                  </Button>
                  <button
                    type="button"
                    onClick={isListening ? detenerEntradaPorVoz : iniciarEntradaPorVoz}
                    disabled={loading || !voiceInputSupported}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      isListening
                        ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                        : "border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
                    } ${loading || !voiceInputSupported ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <span aria-hidden="true">{isListening ? "■" : "🎤"}</span>
                    {isListening ? "Detener y enviar" : "Hablar"}
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  {voiceInputSupported
                    ? isListening
                      ? "Hablá con naturalidad. Al detenerse, la pregunta se enviará automáticamente."
                      : "Podés dictar tu pregunta con el micrófono y se completará en el campo de texto."
                    : "Este navegador no soporta dictado por voz, pero podés escribir tu pregunta manualmente."}
                </p>
                {voiceMessage && (
                  <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                    {voiceMessage}
                  </p>
                )}
              </div>
            </form>
            <div className="mt-4">
              <CardTitle className="text-lg font-bold">
                Preguntas Frecuentes
              </CardTitle>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {preguntasFrecuentes.map((pregunta, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => reset({ pregunta })}
                    className="text-left w-full p-2 bg-[#E5E7EB] rounded hover:bg-[#D1D5DB] text-sm"
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
        <Card className="h-full shadow-md border border-[#D1D5DB] bg-[#F3F4F6]">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="text-lg font-bold">
              Historial de Interacción
            </CardTitle>
            {loading && (
              <div className="text-sm text-gray-600">
                ⏱️ Tiempo transcurrido: {formatTiempo(tiempo)}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="p-4 bg-white rounded-lg border border-[#D1D5DB] shadow-sm">
                <LoadingSVG />
                <p className="mt-2 text-gray-600">Cargando respuesta...</p>
              </div>
            )}
            {!loading && historial.length === 0 && (
              <p className="text-gray-600">
                Las respuestas del agente aparecerán aquí.
              </p>
            )}
            {!loading &&
              historial.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-lg border border-gray-300"
                >
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
