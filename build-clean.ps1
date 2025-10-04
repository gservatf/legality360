Write-Host "🧹 Iniciando limpieza de entorno Supabase/Vite..." -ForegroundColor Cyan

# ---------------------------------------------------------------------------
# 1️⃣ Eliminar duplicados de archivos relacionados con Supabase
# ---------------------------------------------------------------------------

Write-Host "🧽 Eliminando duplicados de supabase..." -ForegroundColor Yellow

# Elimina cualquier archivo llamado "supabase.*" excepto el correcto src/lib/supabase.ts
Get-ChildItem -Recurse -Filter "supabase.*" | Where-Object {
    $_.FullName -match "backup" -or
    $_.FullName -match "storage" -or
    $_.FullName -match "supabaseClient" -or
    ($_.FullName -match "supabase.ts" -and $_.FullName -notmatch "src\\lib\\supabase.ts")
} | ForEach-Object {
    Write-Host "🗑 Eliminando duplicado: $($_.FullName)" -ForegroundColor DarkGray
    Remove-Item -Force -ErrorAction SilentlyContinue
}

Write-Host "✅ Limpieza completada. El archivo src/lib/supabase.ts queda protegido." -ForegroundColor Green


# ---------------------------------------------------------------------------
# 2️⃣ Limpiar entorno local (node_modules, dist, vite cache)
# ---------------------------------------------------------------------------
Write-Host "🧼 Limpiando entorno local (node_modules, dist, vite cache)..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules, dist, .vite -ErrorAction SilentlyContinue
npm cache clean --force
Write-Host "✅ Entorno limpio." -ForegroundColor Green


# ---------------------------------------------------------------------------
# 3️⃣ Reinstalar dependencias
# ---------------------------------------------------------------------------
Write-Host "📦 Reinstalando dependencias..." -ForegroundColor Yellow
npm install --legacy-peer-deps --force
Write-Host "✅ Dependencias reinstaladas correctamente." -ForegroundColor Green


# ---------------------------------------------------------------------------
# 4️⃣ Verificar existencia del archivo src/lib/supabase.ts
# ---------------------------------------------------------------------------
Write-Host "🔍 Verificando archivo src/lib/supabase.ts..." -ForegroundColor Yellow
$SupabasePath = "src/lib/supabase.ts"
if (Test-Path $SupabasePath) {
    Write-Host "✅ Archivo supabase.ts detectado correctamente." -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: No se encontró $SupabasePath. Asegúrate de que existe en la ruta principal." -ForegroundColor Red
    exit 1
}

# ---------------------------------------------------------------------------
# 5️⃣ Ejecutar build limpio
# ---------------------------------------------------------------------------
Write-Host "🏗️ Ejecutando build limpio..." -ForegroundColor Cyan
npm run build
Write-Host "🎯 Build finalizado correctamente (si no hubo errores arriba)." -ForegroundColor Green
