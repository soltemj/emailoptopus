#!/bin/bash
# Script para crear el paquete de instalación completo

echo "📦 Creando paquete de instalación MailHub..."

# Crear directorio temporal
TEMP_DIR="mailhub-centos7-$(date +%Y%m%d)"
mkdir -p $TEMP_DIR

# Copiar archivos de configuración
cp apache-mailhub.conf $TEMP_DIR/
cp install-mailhub.sh $TEMP_DIR/
cp deploy-app.sh $TEMP_DIR/
cp vitalpbx-integration.sh $TEMP_DIR/
cp README-INSTALACION.md $TEMP_DIR/

# Hacer ejecutables los scripts
chmod +x $TEMP_DIR/*.sh

# Generar build de producción si existe package.json
if [ -f "../package.json" ]; then
    echo "🔨 Generando build de producción..."
    cd ..
    npm run build
    cd deployment
    
    # Copiar build al paquete
    cp -r ../dist $TEMP_DIR/app-files/
    echo "✅ Build incluido en el paquete"
fi

# Crear archivo de instalación automatizada
cat > $TEMP_DIR/install-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Instalación automática de MailHub"
echo "Este script instalará todo automáticamente"
echo ""

# Instalar sistema base
echo "1/4 Instalando base del sistema..."
./install-mailhub.sh

# Configurar VitalPBX
echo "2/4 Configurando VitalPBX..."
./vitalpbx-integration.sh

# Desplegar aplicación si existe
if [ -d "./app-files" ]; then
    echo "3/4 Desplegando aplicación..."
    cp -r ./app-files/* /var/www/html/mailhub/
    chown -R apache:apache /var/www/html/mailhub
    systemctl restart httpd
    echo "✅ Aplicación desplegada"
else
    echo "3/4 Aplicación no incluida, desplegar manualmente"
fi

echo "4/4 Verificando instalación..."
sleep 2
curl -I http://localhost/mailhub/ >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ ¡Instalación completada exitosamente!"
    echo ""
    echo "🌐 Acceder a: http://$(hostname -I | awk '{print $1}')/mailhub/"
else
    echo "⚠️  Verificar configuración manualmente"
fi

echo ""
echo "📋 Ver logs: tail -f /var/log/httpd/mailhub_*.log"
echo "⚙️  Gestión: systemctl status httpd"
EOF

chmod +x $TEMP_DIR/install-all.sh

# Crear archivo de información del sistema
cat > $TEMP_DIR/SISTEMA-INFO.txt << EOF
MAILHUB - INFORMACIÓN DEL SISTEMA
================================

Fecha de creación: $(date)
Versión: MailHub v1.0 para CentOS 7

CONTENIDO DEL PAQUETE:
- apache-mailhub.conf: Configuración de Apache
- install-mailhub.sh: Instalación base del sistema
- deploy-app.sh: Script de despliegue de aplicación
- vitalpbx-integration.sh: Integración con VitalPBX
- install-all.sh: Instalación automática completa
- README-INSTALACION.md: Guía detallada

REQUISITOS MÍNIMOS:
- CentOS 7
- 2GB RAM
- 10GB espacio libre
- Acceso root
- Conexión a Internet

INSTALACIÓN RÁPIDA:
1. Extraer archivos: tar -xzf mailhub-centos7-*.tar.gz
2. Entrar al directorio: cd mailhub-centos7-*/
3. Ejecutar instalación: ./install-all.sh

INSTALACIÓN MANUAL:
Seguir las instrucciones en README-INSTALACION.md

SOPORTE:
Email: info@zysolutions.com
Teléfono: +1 (809) 633-1000
Web: https://zysolutions.com

EOF

# Crear archivo comprimido
echo "📦 Comprimiendo archivos..."
tar -czf "${TEMP_DIR}.tar.gz" $TEMP_DIR/

# Crear también ZIP para Windows
if command -v zip >/dev/null 2>&1; then
    zip -r "${TEMP_DIR}.zip" $TEMP_DIR/
    echo "✅ Creado: ${TEMP_DIR}.zip"
fi

# Limpiar directorio temporal
rm -rf $TEMP_DIR

echo "✅ Paquete creado: ${TEMP_DIR}.tar.gz"
echo ""
echo "📋 INSTRUCCIONES DE USO:"
echo "1. Subir el archivo al servidor CentOS 7"
echo "2. Extraer: tar -xzf ${TEMP_DIR}.tar.gz"
echo "3. Entrar: cd ${TEMP_DIR}/"
echo "4. Ejecutar: ./install-all.sh"
echo ""
echo "📁 El paquete contiene todo lo necesario para la instalación"