Write-Host "⚡ Build rápido (sin reinstalar dependencias)..." -ForegroundColor Cyan
Remove-Item -Recurse -Force dist, .vite -ErrorAction SilentlyContinue
npm run build
Write-Host "✅ Build completado." -ForegroundColor Green
