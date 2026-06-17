# 🚀 Guía Rápida - Nueva Interfaz de Chat

## ⚡ Acceso Instantáneo

```
URL: http://localhost:3000/preguntas/new
```

---

## 🎬 Lo que Verás

### PANTALLA 1: Hero (Inicial)

```
┌─────────────────────────────────────────┐
│                                         │
│          [IA LOGO CON GLOW]             │
│                                         │
│     ASISTENTE IA                        │
│     ¿Por dónde empezamos hoy?          │
│                                         │
│    ┌─────────┬──────────┬────────────┐ │
│    │ 📷      │ ✍️      │ 🔍         │ │
│    │ Imagen  │ Escribir│ Buscar     │ │
│    └─────────┴──────────┴────────────┘ │
│                                         │
│      [Comenzar a chatear]               │
│                                         │
└─────────────────────────────────────────┘
```

### PANTALLA 2: Chat (Después de hacer click)

```
┌─────────────────────────────────────────┐
│  [Header]  Asistente IA          [🔊]   │
├─────────────────────────────────────────┤
│                                         │
│  [TÚ] - 10:30 AM                        │
│  ┌─────────────────────────────────┐   │
│  │ Hola, ¿cómo estás?              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [IA] - 10:31 AM                        │
│  ┌─────────────────────────────────┐   │
│  │ ¡Hola! Estoy aquí para ayudarte │   │
│  │ ¿Necesitas ayuda con algo?      │   │
│  └─────────────────────────────────┘   │
│                                         │
│                   ↓ [Limpiar chat]     │
│                                         │
├─────────────────────────────────────────┤
│  ┌────────────────────────────────────┐ │
│  │ Escribe tu mensaje...              │ │ (input)
│  │                           [🎤] [➤]  │ │
│  └────────────────────────────────────┘ │
│     [📷] [✍️] [🔍]    [🎙️] [🔊]        │
│   Acciones rápidas    Controles audio   │
└─────────────────────────────────────────┘
```

---

## 🎮 Cómo Interactuar

### Enviar Mensaje
1. Escribe en la caja de texto
2. Presiona **Enter** o click en botón **➤**
3. IA responde automáticamente
4. Opcionalmente: IA lee la respuesta

### Usar Micrófono
1. Click en **🎤** (rojo cuando activo)
2. Habla claramente en español
3. El texto aparece automáticamente
4. Presiona Enter para enviar

### Controlar Audio
- **🔊 Header**: Toggle general de audio
- **🎙️ Footer**: Alternar síntesis de voz
- **🎤 Footer**: Activar micrófono

---

## 🎨 Colores Utilizados

```
Tema: OSCURO MODERNO (Slate + Cyan)

Fondo:           Negro (#0f172a)
Elementos:       Gris oscuro (#1e293b)
Texto:           Blanco (#f1f5f9)
Botones activos: Cyan (#06b6d4)
Usuario:         Azul gradiente
IA:              Verde gradiente
Micrófono:       Rojo cuando activo
```

---

## 💡 Casos de Uso

### Caso 1: Búsqueda Rápida
```
1. Click en "🔍 Buscar información"
2. Escribe lo que necesitas
3. IA busca y responde
4. Resultado en chat
```

### Caso 2: Crear Contenido
```
1. Click en "✍️ Escribir o editar"
2. Describe lo que necesitas
3. IA genera contenido
4. Puedes refinar en el chat
```

### Caso 3: Entrada por Voz
```
1. Click en micrófono 🎤
2. Habla: "¿Cuál es el clima hoy?"
3. Transcript aparece en input
4. IA responde y lee la respuesta
```

---

## 🎯 Funciones de Cada Botón

```
┌──────────────────────────────────────────┐
│           BARRA DE ENTRADA               │
├──────────────────────────────────────────┤
│ TEXTAREA: [Escribe aquí...]              │
│           [Shift+Enter para nueva línea] │
│                                          │
│ BOTONES:                                 │
│ [🎤] - Activar micrófono                │
│ [➤]  - Enviar mensaje                   │
│ [📷] - Crear imagen (acción rápida)     │
│ [✍️]  - Escribir (acción rápida)        │
│ [🔍]  - Buscar (acción rápida)          │
│ [🎙️] - Toggle síntesis de voz          │
│ [🔊] - Toggle audio general             │
└──────────────────────────────────────────┘
```

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| **Enter** | Enviar mensaje |
| **Shift+Enter** | Nueva línea |
| **Tab** | Navegar botones |
| **Esc** | Cancelar grabación |

---

## 🔊 Estado del Audio

### Micrófono
```
🎤 GRIS   → Desactivado
🎤 ROJO   → Escuchando/Grabando
          → Punto parpadeante indica actividad
```

### Speaker
```
🔊 GRIS   → Audio desactivado
🔊 CYAN   → Audio activo (leyendo)
          → Punto parpadeante indica reproducción
```

---

## 🌐 Navegadores Soportados

```
✅ Chrome 90+
✅ Edge 90+
✅ Safari 14.1+
✅ Firefox 88+

❌ Internet Explorer (no soportado)
```

---

## 📱 Responsive Design

```
MOBILE (< 640px)
├─ Stack vertical
├─ Botones más grandes
├─ Input full-width
└─ Texto más legible

TABLET (640px - 1024px)
├─ Layout híbrido
├─ Botones medianos
└─ Óptimo para gestos

DESKTOP (> 1024px)
├─ Layout completo
├─ Máximo ancho 56rem (896px)
└─ Hover effects activados
```

---

## 🆘 Troubleshooting

### ¿El micrófono no funciona?
1. Verifica permisos del navegador
2. Recarga la página (F5)
3. Intenta en navegador diferente
4. Comprueba que has hablado

### ¿La IA no responde?
1. Abre DevTools (F12)
2. Mira la pestaña Network
3. Verifica que la API está disponible
4. Comprueba `NEXT_PUBLIC_BACKEND_URL`

### ¿Audio no funciona?
1. Verifica volumen del sistema
2. Intenta en otro navegador
3. Comprueba que `audioEnabled` está ON
4. Recarga la página

### ¿Mensaje no se envía?
1. Verifica que escribiste algo
2. Presiona Enter (no solo click)
3. Comprueba conexión a internet
4. Abre console para ver errores

---

## 📊 Estructura de Datos

### Mensaje en el Chat
```typescript
interface Message {
  id: string;              // Timestamp
  role: "user" | "assistant";
  content: string;         // Texto del mensaje
  timestamp: Date;         // Hora exacta
}
```

### Estado del Componente
```typescript
[view]              // "hero" | "chat"
[messages]          // Array de mensajes
[inputValue]        // Texto en el input
[isTyping]          // IA está respondiendo
[isListening]       // Micrófono activo
[isSpeaking]        // Leyendo respuesta
[audioEnabled]      // Audio activado
```

---

## 🎁 Bonus: Comandos Útiles

```bash
# Desarrollo
npm run dev           # Inicia servidor (http://localhost:3000)

# Build
npm run build        # Compilar para producción

# Linting
npm run lint         # Verificar código

# Formato
npm run format       # Formatear código (si disponible)
```

---

## 📞 Soporte Rápido

**Problema más común:** "No aparece el micrófono"  
**Solución:** Recarga la página y da permiso cuando el navegador lo pida

**Problema:** "La IA no responde"  
**Solución:** Verifica que el backend está corriendo

**Problema:** "El chat se ve raro"  
**Solución:** Abre DevTools (F12) → Console para ver errores

---

## ✨ Tips & Tricks

1. **Usa acciones rápidas** para contexto automático
2. **Habla claramente** para mejor reconocimiento de voz
3. **Prueba Shift+Enter** para escribir párrafos completos
4. **Desactiva audio** si está en un lugar público
5. **Limpia el chat** entre temas diferentes

---

## 🎓 Próxima Vez

La próxima vez que visites `/preguntas/new`:
- El chat será nuevo (no se guarda entre sesiones)
- Tus preferencias de audio se mantienen
- Puedes seguir usando todas las funciones

---

**¡Listo para chatear! 🚀**

**Accede a:** `http://localhost:3000/preguntas/new`
