#!/bin/bash
# Script para desplegar la aplicación MailHub
# Ejecutar después de generar el build con npm run build

echo "🚀 Desplegando MailHub..."

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Verificar que existe el directorio dist
if [ ! -d "./dist" ]; then
    error "No se encontró el directorio 'dist'. Ejecuta 'npm run build' primero."
fi

# Variables
APP_DIR="/var/www/html/mailhub"
BACKUP_DIR="/var/www/html/mailhub.backup.$(date +%Y%m%d%H%M%S)"

# Verificar permisos
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root (sudo)"
fi

# 1. Crear backup
if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
    log "Creando backup en $BACKUP_DIR..."
    cp -r $APP_DIR $BACKUP_DIR
    log "Backup creado exitosamente"
fi

# 2. Detener Apache temporalmente
log "Deteniendo Apache..."
systemctl stop httpd

# 3. Limpiar directorio anterior
log "Limpiando directorio de aplicación..."
rm -rf $APP_DIR/*

# 4. Copiar nuevos archivos
log "Copiando nuevos archivos..."
cp -r ./dist/* $APP_DIR/

# 5. Crear archivo de configuración de runtime
log "Creando configuración de runtime..."
cat > $APP_DIR/config.js << 'EOF'
// Configuración de runtime para MailHub
window.MAILHUB_CONFIG = {
  API_BASE_URL: window.location.origin,
  PBX_URL: 'https://zyserver21.dyndns.info',
  SUPABASE_URL: 'https://byjeirimbkklgdxqcckm.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5amVpcmltYmtrbGdkeHFjY2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTAyNjMsImV4cCI6MjA2ODk4NjI2M30.lJCLaCQrttHuCEIQamsCbSPx6y69kJWMVaWnPUE7JF8'
};
EOF

# 6. Configurar permisos
log "Configurando permisos..."
chown -R apache:apache $APP_DIR
chmod -R 755 $APP_DIR

# 7. Configurar SELinux
if command -v getenforce >/dev/null 2>&1 && [ "$(getenforce)" != "Disabled" ]; then
    log "Configurando contexto SELinux..."
    restorecon -R $APP_DIR
fi

# 8. Reiniciar Apache
log "Reiniciando Apache..."
systemctl start httpd

# Verificar que Apache está funcionando
if ! systemctl is-active --quiet httpd; then
    error "Apache no se pudo iniciar. Revisar logs: journalctl -u httpd"
fi

# 9. Verificar despliegue
log "Verificando despliegue..."
sleep 2
curl -I http://localhost/mailhub/ >/dev/null 2>&1
if [ $? -eq 0 ]; then
    log "✅ Despliegue exitoso"
else
    error "❌ Error en el despliegue. Verificar logs de Apache."
fi

# 10. Mostrar información
echo
echo "========================================"
echo "🎉 DESPLIEGUE COMPLETADO"
echo "========================================"
echo "📂 Aplicación desplegada en: $APP_DIR"
echo "💾 Backup anterior en: $BACKUP_DIR"
echo
echo "🌐 URLs de acceso:"
echo "   Local: http://localhost/mailhub/"
echo "   Red:   http://$(hostname -I | awk '{print $1}')/mailhub/"
echo
echo "📋 Comandos útiles:"
echo "   Ver logs: tail -f /var/log/httpd/mailhub_*.log"
echo "   Estado Apache: systemctl status httpd"
echo "   Reiniciar: systemctl restart httpd"
echo "========================================"