// src/app/preguntas/new/page.tsx
import ChatInterfaceSimple from "../../../components/chat/ChatInterfaceSimple";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function NewProductPage() {
  return (
    <ProtectedRoute>
      <ChatInterfaceSimple />
    </ProtectedRoute>
  );
}