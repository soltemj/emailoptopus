#!/bin/bash
# Script de integración con VitalPBX
# Configura los hooks necesarios para integrar MailHub con VitalPBX

echo "🔗 Configurando integración VitalPBX..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Verificar que VitalPBX está instalado
if [ ! -d "/usr/share/vitalpbx" ]; then
    warning "VitalPBX no detectado en la ubicación estándar"
    warning "Continuando con configuración genérica..."
fi

# 1. Configurar proxy reverso para VitalPBX en Apache
log "Configurando proxy para VitalPBX..."
cat > /etc/httpd/conf.d/vitalpbx-proxy.conf << 'EOF'
# Proxy configuration for VitalPBX integration
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so

# VitalPBX API Proxy
<Location "/api/vitalpbx/">
    ProxyPreserveHost On
    ProxyPass https://zyserver21.dyndns.info/
    ProxyPassReverse https://zyserver21.dyndns.info/
    
    # Headers de CORS para VitalPBX
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With"
    
    # Timeout configuration
    ProxyTimeout 300
    ProxyConnectTimeout 30
</Location>

# WebSocket proxy para eventos en tiempo real (si se requiere)
<Location "/ws/vitalpbx/">
    ProxyPreserveHost On
    ProxyPass ws://zyserver21.dyndns.info/ws/
    ProxyPassReverse ws://zyserver21.dyndns.info/ws/
</Location>
EOF

# 2. Crear script de monitoreo de VitalPBX
log "Creando script de monitoreo..."
mkdir -p /opt/mailhub/scripts

cat > /opt/mailhub/scripts/vitalpbx-monitor.sh << 'EOF'
#!/bin/bash
# Monitor de eventos de VitalPBX para MailHub

VITALPBX_URL="https://zyserver21.dyndns.info"
MAILHUB_WEBHOOK="http://localhost/mailhub/api/webhooks/vitalpbx"
LOG_FILE="/var/log/mailhub-vitalpbx.log"

# Función de logging
log_event() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Monitorear llamadas (ejemplo)
monitor_calls() {
    while true; do
        # Aquí iría la lógica específica para monitorear eventos de VitalPBX
        # Este es un ejemplo básico
        
        CALL_DATA=$(curl -s -k "$VITALPBX_URL/api/calls/active" 2>/dev/null)
        
        if [ $? -eq 0 ] && [ ! -z "$CALL_DATA" ]; then
            # Enviar datos a MailHub
            curl -X POST \
                -H "Content-Type: application/json" \
                -d "$CALL_DATA" \
                "$MAILHUB_WEBHOOK" \
                >/dev/null 2>&1
                
            log_event "Call data sent to MailHub"
        fi
        
        sleep 10
    done
}

# Función principal
main() {
    log_event "VitalPBX monitor started"
    monitor_calls
}

# Ejecutar solo si no está ya corriendo
PIDFILE="/var/run/vitalpbx-monitor.pid"

if [ -f "$PIDFILE" ] && kill -0 `cat $PIDFILE` 2>/dev/null; then
    echo "Monitor ya está ejecutándose (PID: $(cat $PIDFILE))"
    exit 1
fi

echo $$ > $PIDFILE
trap "rm -f $PIDFILE; exit" INT TERM EXIT

main
EOF

chmod +x /opt/mailhub/scripts/vitalpbx-monitor.sh

# 3. Crear servicio systemd para el monitor
log "Creando servicio systemd..."
cat > /etc/systemd/system/mailhub-vitalpbx.service << 'EOF'
[Unit]
Description=MailHub VitalPBX Integration Monitor
After=network.target httpd.service
Wants=httpd.service

[Service]
Type=simple
User=apache
Group=apache
ExecStart=/opt/mailhub/scripts/vitalpbx-monitor.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 4. Configurar logrotate para los logs
log "Configurando rotación de logs..."
cat > /etc/logrotate.d/mailhub-vitalpbx << 'EOF'
/var/log/mailhub-vitalpbx.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    postrotate
        systemctl reload mailhub-vitalpbx.service
    endscript
}
EOF

# 5. Configurar permisos
chown -R apache:apache /opt/mailhub
chmod -R 755 /opt/mailhub
touch /var/log/mailhub-vitalpbx.log
chown apache:apache /var/log/mailhub-vitalpbx.log

# 6. Habilitar y arrancar servicios
log "Habilitando servicios..."
systemctl daemon-reload
systemctl enable mailhub-vitalpbx.service

# 7. Reiniciar Apache para aplicar configuración de proxy
log "Reiniciando Apache..."
systemctl restart httpd

if ! systemctl is-active --quiet httpd; then
    error "Error al reiniciar Apache. Verificar configuración."
fi

# 8. Verificar configuración
log "Verificando configuración..."
httpd -t
if [ $? -ne 0 ]; then
    error "Error en configuración de Apache"
fi

echo
echo "========================================"
echo "🔗 INTEGRACIÓN VITALPBX CONFIGURADA"
echo "========================================"
echo "📂 Scripts: /opt/mailhub/scripts/"
echo "📋 Logs: /var/log/mailhub-vitalpbx.log"
echo "⚙️  Servicio: mailhub-vitalpbx.service"
echo
echo "🔧 Comandos útiles:"
echo "   Iniciar monitor: systemctl start mailhub-vitalpbx"
echo "   Ver logs: journalctl -u mailhub-vitalpbx -f"
echo "   Estado: systemctl status mailhub-vitalpbx"
echo
echo "🌐 Proxy configurado:"
echo "   /api/vitalpbx/ -> https://zyserver21.dyndns.info/"
echo "========================================"

log "✅ Integración VitalPBX completada"