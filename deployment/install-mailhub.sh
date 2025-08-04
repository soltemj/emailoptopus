#!/bin/bash
# Script de instalación de MailHub en CentOS 7
# ZY Solutions - MailHub Deployment Script

echo "🚀 Iniciando instalación de MailHub..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar que se ejecuta como root
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root (sudo)"
fi

log "Verificando sistema CentOS 7..."
if ! grep -q "CentOS Linux 7" /etc/centos-release 2>/dev/null; then
    warning "No se detectó CentOS 7. Continuando..."
fi

# 1. Actualizar sistema
log "Actualizando sistema..."
yum update -y

# 2. Instalar dependencias necesarias
log "Instalando dependencias..."
yum install -y httpd mod_ssl mod_rewrite mod_expires mod_headers mod_deflate wget unzip

# 3. Habilitar módulos de Apache
log "Configurando módulos de Apache..."
systemctl enable httpd

# 4. Crear directorio de la aplicación
log "Creando estructura de directorios..."
mkdir -p /var/www/html/mailhub
mkdir -p /var/log/httpd
mkdir -p /etc/httpd/ssl

# 5. Configurar permisos
chown -R apache:apache /var/www/html/mailhub
chmod -R 755 /var/www/html/mailhub

# 6. Copiar configuración de Apache
log "Configurando Apache..."
if [ -f "./apache-mailhub.conf" ]; then
    cp ./apache-mailhub.conf /etc/httpd/conf.d/mailhub.conf
    log "Configuración de Apache copiada"
else
    error "No se encontró el archivo apache-mailhub.conf"
fi

# 7. Configurar SELinux (si está habilitado)
if command -v getenforce >/dev/null 2>&1 && [ "$(getenforce)" != "Disabled" ]; then
    log "Configurando SELinux..."
    setsebool -P httpd_can_network_connect 1
    setsebool -P httpd_can_network_relay 1
    setsebool -P httpd_use_openstack 1
    restorecon -R /var/www/html/mailhub
fi

# 8. Configurar firewall
log "Configurando firewall..."
if systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --permanent --add-port=80/tcp
    firewall-cmd --permanent --add-port=443/tcp
    firewall-cmd --reload
    log "Firewall configurado"
fi

# 9. Crear certificado SSL autofirmado
log "Generando certificado SSL autofirmado..."
if [ ! -f /etc/pki/tls/certs/localhost.crt ]; then
    openssl req -new -nodes -x509 -subj "/C=DO/ST=SantoDomingo/L=SantoDomingo/O=ZYSolutions/CN=mailhub.zysolutions.local" -days 3650 -keyout /etc/pki/tls/private/localhost.key -out /etc/pki/tls/certs/localhost.crt -extensions v3_ca
    chmod 600 /etc/pki/tls/private/localhost.key
    chmod 644 /etc/pki/tls/certs/localhost.crt
fi

# 10. Verificar configuración de Apache
log "Verificando configuración de Apache..."
httpd -t
if [ $? -ne 0 ]; then
    error "Error en la configuración de Apache"
fi

# 11. Reiniciar Apache
log "Reiniciando Apache..."
systemctl restart httpd
systemctl enable httpd

if ! systemctl is-active --quiet httpd; then
    error "Apache no se pudo iniciar correctamente"
fi

# 12. Crear script de actualización
log "Creando script de actualización..."
cat > /usr/local/bin/update-mailhub.sh << 'EOF'
#!/bin/bash
# Script para actualizar MailHub

BACKUP_DIR="/var/www/html/mailhub.backup.$(date +%Y%m%d%H%M%S)"
APP_DIR="/var/www/html/mailhub"

echo "Creando backup..."
cp -r $APP_DIR $BACKUP_DIR

echo "Deteniendo Apache..."
systemctl stop httpd

echo "Actualizando archivos..."
if [ -f "./dist.zip" ]; then
    cd /tmp
    unzip -o ./dist.zip
    rm -rf $APP_DIR/*
    cp -r ./dist/* $APP_DIR/
    chown -R apache:apache $APP_DIR
    chmod -R 755 $APP_DIR
    echo "Archivos actualizados"
else
    echo "No se encontró dist.zip"
    exit 1
fi

echo "Reiniciando Apache..."
systemctl start httpd

echo "Actualización completada"
EOF

chmod +x /usr/local/bin/update-mailhub.sh

# 13. Verificar estado
log "Verificando instalación..."
curl -I http://localhost/mailhub/ >/dev/null 2>&1
if [ $? -eq 0 ]; then
    log "✅ MailHub instalado correctamente"
else
    warning "⚠️  Verificar configuración manualmente"
fi

# 14. Mostrar información final
echo
echo "========================================"
echo "🎉 INSTALACIÓN COMPLETADA"
echo "========================================"
echo "📂 Directorio de la app: /var/www/html/mailhub"
echo "⚙️  Configuración Apache: /etc/httpd/conf.d/mailhub.conf"
echo "📋 Logs de Apache: /var/log/httpd/mailhub_*.log"
echo "🔄 Script de actualización: /usr/local/bin/update-mailhub.sh"
echo
echo "🌐 URLs de acceso:"
echo "   HTTP:  http://$(hostname -I | awk '{print $1}')/mailhub/"
echo "   HTTPS: https://$(hostname -I | awk '{print $1}')/mailhub/"
echo
echo "📝 Para desplegar la aplicación:"
echo "   1. Generar build: npm run build"
echo "   2. Subir dist.zip al servidor"
echo "   3. Ejecutar: /usr/local/bin/update-mailhub.sh"
echo "========================================"