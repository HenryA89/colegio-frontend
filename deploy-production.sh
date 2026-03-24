#!/bin/bash

# Script de deploy para producción de Estud-IA
# Uso: ./deploy-production.sh

echo "🚀 Iniciando deploy de Estud-IA a producción..."

# 1. Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf dist
rm -rf node_modules/.cache

# 2. Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --production=false

# 3. Verificar variables de entorno
echo "🔍 Verificando configuración..."
if [ ! -f ".env.production" ]; then
    echo "⚠️  Creando .env.production desde .env.example..."
    cp .env.example .env.production
    echo "📝 Por favor, ajusta las variables en .env.production"
fi

# 4. Build de producción
echo "🔨 Construyendo para producción..."
npm run build

# 5. Verificar build
if [ -d "dist" ]; then
    echo "✅ Build exitoso"
    echo "📊 Estadísticas del build:"
    du -sh dist
    find dist -name "*.js" -o -name "*.css" | wc -l | xargs echo "Archivos generados:"
else
    echo "❌ Error en el build"
    exit 1
fi

# 6. Optimizar para producción
echo "⚡ Optimizando para producción..."
# Comprimir archivos si es necesario
find dist -name "*.js" -exec gzip -k {} \;
find dist -name "*.css" -exec gzip -k {} \;

# 7. Preparar para deploy
echo "📋 Preparando para deploy..."
echo "✨ Build listo para producción"
echo "🌐 Archivos en dist/:"
ls -la dist

echo "🎉 Deploy de producción completado"
echo "🔄 Siguiente paso: git push origin main para deploy automático en Vercel"
