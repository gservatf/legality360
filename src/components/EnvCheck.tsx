import React, { useEffect } from "react"

export default function EnvCheck() {
  useEffect(() => {
    console.log("🔎 Verificando variables de entorno...")
    console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL)
    console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY)
  }, [])

  return (
    <div style={{ padding: "1rem", background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "8px" }}>
      <h3>Env Check</h3>
      <p>Revisa la consola del navegador (F12 → Console).</p>
      <p>Si ves <b>undefined</b>, Vercel no está inyectando las variables.</p>
    </div>
  )
}
