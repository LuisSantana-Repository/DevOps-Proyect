# Sentry Testing Scripts

Scripts para probar la integración de Sentry con logs y errores.

## 📋 Scripts Disponibles

### 1. `sentry.sh` - Debug Routes Testing
Prueba todos los endpoints de debug (errores y logs de prueba).

```bash
./sentry.sh
```

**Qué hace:**
- ✅ Health check
- 📝 Genera logs simples y múltiples
- ⚠️ Simula errores HTTP (400, 404, 500)
- 🔴 Genera errores JavaScript (TypeError, ReferenceError)
- 💾 Simula errores de base de datos
- ⚙️ Errores personalizados con contexto

**Requests:** ~13 endpoints de debug

---

### 2. `test-api-endpoints.sh` - All API Endpoints
Prueba TODOS los endpoints reales de la aplicación (Users, Classes, Courses, etc.).

```bash
./test-api-endpoints.sh
```

**Qué hace:**
- 🔐 Login/Logout
- 👤 Endpoints de Users (GET, POST)
- 📚 Endpoints de Classes
- 📖 Endpoints de Courses
- 🏫 Endpoints de Classrooms
- 📅 Endpoints de Schedules
- ❌ Prueba endpoints inválidos (404)
- 🚫 Prueba requests mal formados
- 🔒 Prueba acceso sin autenticación

**Requests:** ~25+ endpoints de la API completa

---

### 3. `test-normal-activity.sh` - User Activity Simulation
Simula actividad normal de usuarios reales.

```bash
./test-normal-activity.sh
```

**Qué hace:**
- 👩‍🎓 Simula usuario Alice (estudiante):
  - Login
  - Ver cursos
  - Ver horario
  - Ver clases
  - Logout

- 👨‍🏫 Simula usuario Bob (profesor):
  - Login
  - Ver usuarios
  - Ver aulas
  - Ver horarios
  - Logout

- ⚠️ Simula errores comunes:
  - Login fallido
  - Acceso no autorizado
  - Recursos no encontrados
  - Endpoints inválidos

**Requests:** ~15 requests de actividad real

---

### 4. `test-stress-logs.sh` - Stress Test
Genera un gran volumen de logs y errores para probar rendimiento.

```bash
./test-stress-logs.sh
```

**Qué hace:**
- 📊 20 logs de diferentes niveles
- 🔴 15 errores variados
- 📝 10 multi-level logs
- ⚙️ 15 errores personalizados con contexto
- 🎯 20 errores aleatorios mixtos
- 💥 50 requests rápidos en burst
- 💚 10 health checks

**Requests:** ~160+ requests en segundos

---

## 🚀 Cómo Usar

### Prerrequisitos

1. **Iniciar el servidor:**
```bash
node server.js
```

2. **Verificar que `jq` está instalado** (para formatear JSON):
```bash
# En Linux/Mac
sudo apt install jq  # Ubuntu/Debian
brew install jq      # macOS

# En Windows (Git Bash)
# jq generalmente viene incluido con Git Bash
```

### Ejecutar Scripts

```bash
# Debug routes (errores de prueba)
./sentry.sh

# Todos los endpoints de la API
./test-api-endpoints.sh

# Actividad normal de usuarios
./test-normal-activity.sh

# Stress test (mucho volumen)
./test-stress-logs.sh
```

### Ejecutar Todos en Secuencia

```bash
./sentry.sh && \
./test-normal-activity.sh && \
./test-api-endpoints.sh && \
./test-stress-logs.sh
```

---

## 📊 Ver Resultados en Sentry

1. Ir a https://sentry.io/
2. Navegar a tu proyecto
3. Revisar:
   - **Issues:** Errores capturados
   - **Performance:** Transacciones y tiempos
   - **Releases:** Si configuraste releases

### Filtros Útiles en Sentry

- **Por nivel:** `level:error`, `level:warning`, `level:info`
- **Por tags:** `userId:TEST123`, `action:delete`
- **Por tipo:** `TypeError`, `ReferenceError`, `MongoNetworkError`

---

## 📝 Logs Generados

### Tipos de Logs
- ✅ **Info** - Información general
- ⚠️ **Warning** - Advertencias
- 🔴 **Error** - Errores capturados
- 🐛 **Debug** - Información de depuración

### Tipos de Errores
- **HTTP Errors:** 400, 404, 500, 503
- **JavaScript Errors:** TypeError, ReferenceError
- **Database Errors:** Connection timeouts, network errors
- **Custom Errors:** Con contexto y tags personalizados

---

## 🎯 Casos de Uso

### Testing Inicial
```bash
./sentry.sh
```
Genera logs de prueba básicos para verificar que Sentry funciona.

### Testing de Integración
```bash
./test-api-endpoints.sh
```
Prueba todos los endpoints reales para verificar logging en producción.

### Simulación de Producción
```bash
./test-normal-activity.sh
```
Simula usuarios reales para ver cómo se verán los logs en producción.

### Performance Testing
```bash
./test-stress-logs.sh
```
Genera alto volumen de logs para probar límites de Sentry.

---

## 🔧 Personalización

### Modificar URL Base
Edita la variable `BASE_URL` en cada script:
```bash
BASE_URL="http://localhost:3001"  # Cambiar a tu URL
```

### Modificar Credenciales
En `test-api-endpoints.sh` y `test-normal-activity.sh`:
```bash
# Cambiar credenciales de login
-d '{"email":"alice@student.edu","password":"password123"}'
```

### Ajustar Volumen de Stress Test
En `test-stress-logs.sh`, modificar los loops:
```bash
for i in {1..20}; do  # Cambiar cantidad
```

---

## 📈 Monitoreo

### Ver Logs en Tiempo Real

Terminal 1:
```bash
node server.js
```

Terminal 2:
```bash
./test-normal-activity.sh
```

Terminal 3:
```bash
# Ver logs del servidor
tail -f server.log
```

---

## ⚠️ Notas Importantes

- **Tests no envían datos a Sentry** - Los tests de Jest mockean Sentry
- **Scripts SÍ envían datos a Sentry** - Los scripts `.sh` envían datos reales
- **Límites de Sentry** - Ten en cuenta el plan de Sentry (requests/mes)
- **Cookies** - Los scripts crean archivos `cookies.txt` temporales

---

## 🆘 Troubleshooting

### Script no ejecuta
```bash
chmod +x *.sh
```

### Servidor no responde
```bash
# Verificar que el servidor está corriendo
curl http://localhost:3001/api/debug/health
```

### `jq` no encontrado
```bash
# Remover | jq . de los scripts
# O instalar jq
```

### No aparecen logs en Sentry
1. Verificar DSN en `server.js`
2. Verificar conexión a internet
3. Revisar console del servidor
4. Esperar 1-2 minutos (delay de Sentry)

---

## 📚 Endpoints Disponibles

### Debug Routes (`/api/debug/`)
- `GET /health` - Health check
- `GET /log` - Simple logs
- `GET /log/multiple` - Multiple log levels
- `GET /error/bad-request` - 400 error
- `GET /error/not-found` - 404 error
- `GET /error/server-error` - 500 error
- `GET /error/type-error` - TypeError
- `GET /error/reference-error` - ReferenceError
- `GET /error/uncaught` - Uncaught exception
- `GET /error/async` - Async error
- `GET /error/database` - Database error
- `GET /error/custom?userId=X&action=Y` - Custom error

### API Routes
- `POST /api/login` - Login
- `GET /api/login/logout` - Logout
- `GET /api/User` - List users
- `GET /api/Class` - List classes
- `GET /api/Course` - List courses
- `GET /api/Classroom` - List classrooms
- `GET /api/Schedule` - List schedules

---

## 🎓 Ejemplos de Uso

### Generar un error específico
```bash
curl http://localhost:3001/api/debug/error/type-error
```

### Generar error con contexto
```bash
curl "http://localhost:3001/api/debug/error/custom?userId=USER123&action=delete"
```

### Login y hacer request
```bash
# Login
curl -c cookies.txt -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@student.edu","password":"password123"}'

# Request autenticado
curl -b cookies.txt http://localhost:3001/api/User
```
