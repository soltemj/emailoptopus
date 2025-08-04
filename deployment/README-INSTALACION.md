# 📋 Guía de Instalación MailHub en CentOS 7

## 🎯 Resumen
Esta guía te ayudará a instalar MailHub en un servidor CentOS 7 con Apache y VitalPBX.

## 📋 Prerrequisitos
- CentOS 7 con acceso root
- VitalPBX instalado y funcionando
- Conexión a Internet
- Mínimo 2GB RAM y 10GB espacio libre

## 📁 Archivos incluidos
```
deployment/
├── apache-mailhub.conf       # Configuración Apache
├── install-mailhub.sh        # Script de instalación
├── deploy-app.sh             # Script de despliegue
├── vitalpbx-integration.sh   # Integración VitalPBX
└── README-INSTALACION.md     # Esta guía
```

## 🚀 Instalación Paso a Paso

### Paso 1: Preparar el servidor
```bash
# Conectar por SSH como root
ssh root@tu-servidor

# Crear directorio de trabajo
mkdir -p /tmp/mailhub-install
cd /tmp/mailhub-install
```

### Paso 2: Subir archivos de instalación
Sube todos los archivos de la carpeta `deployment/` al servidor:
```bash
# Opción 1: Usando SCP desde tu máquina local
scp -r deployment/* root@tu-servidor:/tmp/mailhub-install/

# Opción 2: Usando wget (si tienes los archivos en un servidor web)
wget http://tu-servidor-archivos/deployment.zip
unzip deployment.zip
```

### Paso 3: Ejecutar instalación base
```bash
# Hacer ejecutables los scripts
chmod +x *.sh

# Ejecutar instalación
./install-mailhub.sh
```

Este script:
- ✅ Instala Apache y módulos necesarios
- ✅ Configura Virtual Host para MailHub
- ✅ Configura SSL autofirmado
- ✅ Abre puertos en firewall
- ✅ Configura SELinux
- ✅ Crea scripts de mantenimiento

### Paso 4: Configurar integración VitalPBX
```bash
# Ejecutar configuración VitalPBX
./vitalpbx-integration.sh
```

Este script:
- ✅ Configura proxy reverso para VitalPBX
- ✅ Crea monitor de eventos
- ✅ Configura servicios systemd
- ✅ Establece logging automático

### Paso 5: Desplegar la aplicación

En tu máquina de desarrollo:
```bash
# Generar build de producción
npm run build

# Crear ZIP con los archivos
cd dist
zip -r ../mailhub-app.zip *
cd ..
```

En el servidor:
```bash
# Subir el ZIP al servidor
scp mailhub-app.zip root@tu-servidor:/tmp/

# En el servidor, extraer y desplegar
cd /tmp
unzip mailhub-app.zip -d dist/
cd /tmp/mailhub-install
./deploy-app.sh
```

## 🌐 Verificación de la instalación

### URLs de acceso:
- **HTTP**: `http://tu-servidor-ip/mailhub/`
- **HTTPS**: `https://tu-servidor-ip/mailhub/`
- **Con dominio**: `http://mailhub.zysolutions.local/`

### Verificar servicios:
```bash
# Estado de Apache
systemctl status httpd

# Estado de monitor VitalPBX
systemctl status mailhub-vitalpbx

# Logs de la aplicación
tail -f /var/log/httpd/mailhub_*.log

# Logs de VitalPBX integration
tail -f /var/log/mailhub-vitalpbx.log
```

## 🔧 Configuración Post-instalación

### 1. Configurar dominio personalizado
Editar `/etc/httpd/conf.d/mailhub.conf`:
```apache
ServerName tu-dominio.com
ServerAlias www.tu-dominio.com
```

### 2. SSL con certificado real
```bash
# Instalar Certbot
yum install -y certbot python2-certbot-apache

# Obtener certificado
certbot --apache -d tu-dominio.com
```

### 3. Configurar backup automático
```bash
# Agregar al crontab
crontab -e

# Backup diario a las 2 AM
0 2 * * * /usr/local/bin/backup-mailhub.sh
```

## 🔄 Actualizaciones

Para actualizar la aplicación:
```bash
# En desarrollo, generar nuevo build
npm run build
zip -r mailhub-app.zip dist/*

# Subir al servidor
scp mailhub-app.zip root@servidor:/tmp/

# En servidor, ejecutar actualización
cd /tmp
unzip -o mailhub-app.zip -d dist/
/usr/local/bin/update-mailhub.sh
```

## 🛠️ Solución de problemas

### Apache no inicia
```bash
# Verificar configuración
httpd -t

# Ver logs de error
tail -f /var/log/httpd/error_log

# Verificar puertos
netstat -tlnp | grep :80
```

### VitalPBX no conecta
```bash
# Verificar conectividad
curl -I https://zyserver21.dyndns.info/

# Ver logs del monitor
journalctl -u mailhub-vitalpbx -f

# Reiniciar servicio
systemctl restart mailhub-vitalpbx
```

### Aplicación no carga
```bash
# Verificar permisos
ls -la /var/www/html/mailhub/

# Verificar SELinux
getenforce
setsebool -P httpd_can_network_connect 1

# Limpiar cache del navegador
# Ctrl+F5 o Cmd+Shift+R
```

## 📞 Soporte

Para soporte técnico:
- **Email**: info@zysolutions.com
- **Teléfono**: +1 (809) 633-1000
- **VitalPBX**: https://zyserver21.dyndns.info

## 📝 Notas importantes

1. **Backup**: Siempre realiza backup antes de actualizar
2. **SSL**: Configura SSL en producción
3. **Firewall**: Asegúrate de que los puertos 80/443 estén abiertos
4. **DNS**: Configura DNS para tu dominio
5. **Monitoreo**: Revisa logs regularmente

---
*ZY Solutions - MailHub v1.0*