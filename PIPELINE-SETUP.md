# 🚀 Pipeline Unificado - Configuración

Este pipeline maneja automáticamente **Producción (main)** y **Desarrollo (dev)** con imágenes Docker separadas.

## 📋 Características

### ✅ Triggers Automáticos

**Pull Requests:**
- Se ejecuta en PRs hacia `main` ✓
- Se ejecuta en PRs hacia `dev` ✓

**Commits Directos:**
- Se ejecuta en push a `main` → Construye imagen de **producción** 🚀
- Se ejecuta en push a `dev` → Construye imagen de **desarrollo** 🔧

### 🎯 Stages del Pipeline

1. **Validate** - Ejecuta tests y valida coverage mínimo (siempre)
   - Ejecuta todos los tests con Jest
   - Valida que el coverage sea >= 40% (statements y lines)
   - Valida que el coverage sea >= 30% (functions y branches)
   - **Si el coverage es bajo, el build se detiene aquí** ❌
2. **BuildAndPush** - Construye y sube imagen Docker (solo si coverage >= 40%)
   - `main` → `YOUR_USERNAME/devops-project-prod:latest`
   - `dev` → `YOUR_USERNAME/devops-project-dev:dev`
3. **DeployProduction** - 🔐 **REQUIERE APROBACIÓN MANUAL** (SOLO main con coverage >= 40%)
   - Pipeline se pausa y espera aprobación
   - Notifica a los aprobadores configurados
   - Despliega a Azure solo si se aprueba

---

## 🔧 Configuración Paso a Paso

### **Paso 1: Editar el archivo `azure-pipelines-unified.yml`**

Busca y reemplaza estos placeholders:

```yaml
# Línea 22-23: Nombres de las imágenes Docker
productionImageName:
  value: 'YOUR_DOCKERHUB_USERNAME/devops-project-prod'  # ← Cambia esto

developmentImageName:
  value: 'YOUR_DOCKERHUB_USERNAME/devops-project-dev'   # ← Cambia esto
```

**Ejemplo:**
```yaml
productionImageName:
  value: 'santana981/devops-project-prod'

developmentImageName:
  value: 'santana981/devops-project-dev'
```

### **Paso 2: Configurar Service Connections en Azure DevOps**

#### A) Docker Hub Connection

1. Ve a **Project Settings** → **Service connections**
2. Click **New service connection**
3. Selecciona **Docker Registry**
4. Selecciona **Docker Hub**
5. Ingresa:
   - **Docker ID:** Tu usuario de Docker Hub
   - **Password:** Tu token de acceso de Docker Hub
   - **Service connection name:** `Docker` (o el que pusiste en línea 16)
6. Click **Save**

#### B) Azure Connection (si vas a desplegar)

1. Click **New service connection**
2. Selecciona **Azure Resource Manager**
3. Selecciona **Service principal (automatic)**
4. Ingresa:
   - **Subscription:** Tu suscripción de Azure
   - **Resource group:** (opcional)
   - **Service connection name:** `Azure`
5. Click **Save**

### **Paso 3: Configurar Environment con Aprobación Manual** 🔐

**IMPORTANTE:** Este paso configura la aprobación manual para producción. La imagen Docker NO se desplegará a Azure hasta que alguien apruebe manualmente.

#### ¿Cómo funciona?

El pipeline tiene 3 etapas:

1. **Validate** - Se ejecuta automáticamente ✅
2. **BuildAndPush** - Se ejecuta automáticamente si los tests pasan ✅
3. **DeployProduction** - ⏸️ **ESPERA APROBACIÓN MANUAL** antes de desplegar a Azure

#### Configurar el Environment:

1. Ve a **Pipelines** → **Environments**
2. Click **New environment**
3. Ingresa:
   - **Name:** `production` (debe coincidir exactamente con el YAML)
   - **Description:** "Production environment - requires approval"
   - **Resource:** None (deja vacío)
4. Click **Create**

#### Agregar Aprobaciones:

1. En la página del environment `production`, click en los **3 puntos (⋮)** en la esquina superior derecha
2. Selecciona **Approvals and checks**
3. Click **Approvals**
4. Configura:
   - **Approvers:** Selecciona usuarios o grupos que pueden aprobar (ej: tú mismo, tu equipo)
   - **Minimum number of approvers:** 1 (o más si quieres múltiples aprobadores)
   - **Timeout:** 30 days (tiempo máximo que esperará la aprobación)
   - **Instructions to approvers:** "Please review the changes and approve deployment to production"
5. Click **Save**

#### ¿Qué pasa cuando el pipeline llega a DeployProduction?

```
┌─────────────────────────────────────────────────┐
│  Pipeline Execution Flow                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  Stage 1: Validate                              │
│    ✅ Tests ejecutados                          │
│    ✅ Coverage >= 40%                           │
│                                                 │
│  Stage 2: BuildAndPush                          │
│    ✅ Docker image construida                   │
│    ✅ Image subida a Docker Hub                 │
│         → devops-project-prod:latest            │
│                                                 │
│  Stage 3: DeployProduction                      │
│    ⏸️  ESPERANDO APROBACIÓN...                  │
│                                                 │
│    📧 Email enviado a los aprobadores           │
│    🔔 Notificación en Azure DevOps              │
│                                                 │
│    ┌─────────────────────────────┐             │
│    │  Aprobador revisa cambios   │             │
│    │  ✅ Approve  o  ❌ Reject    │             │
│    └─────────────────────────────┘             │
│                                                 │
│    Si APROBADO:                                 │
│    ✅ Deploy a Azure Web App                    │
│    ✅ Pipeline completo                         │
│                                                 │
│    Si RECHAZADO:                                │
│    ❌ Deploy cancelado                          │
│    ❌ Pipeline falla                            │
└─────────────────────────────────────────────────┘
```

#### Proceso de Aprobación:

1. **Pipeline se ejecuta automáticamente** cuando haces push a `main`
2. **Tests y build completan** - La imagen Docker ya está en Docker Hub
3. **Pipeline se pausa** antes de Deploy
4. **Recibes notificación** (email y en Azure DevOps)
5. **Revisas el pipeline:**
   - Ve a **Pipelines** → Tu pipeline → Click en el run
   - Verás un banner: "This run is waiting for approval on production environment"
6. **Click en "Review"**
7. **Revisas los cambios:**
   - ¿Pasaron todos los tests?
   - ¿El coverage es suficiente?
   - ¿Los commits son correctos?
8. **Tomas decisión:**
   - ✅ **Approve:** Click "Approve" → El deploy a Azure continúa
   - ❌ **Reject:** Click "Reject" → El deploy se cancela
   - 💬 Puedes agregar comentarios explicando tu decisión

#### Ventajas de este enfoque:

✅ **Seguridad:** Nadie puede desplegar a producción sin aprobación
✅ **Flexibilidad:** La imagen ya está en Docker Hub aunque rechaces el deploy
✅ **Trazabilidad:** Todas las aprobaciones quedan registradas
✅ **Control:** Puedes revisar cambios antes de afectar producción

#### Configuraciones Adicionales (Opcional):

Puedes agregar más checks al environment:

1. **Branch control:** Solo permitir deploys desde `main`
   - En Approvals and checks → Branch control
   - Allowed branches: `main`

2. **Business hours:** Solo permitir deploys en horario laboral
   - En Approvals and checks → Business hours
   - Define tu horario permitido

3. **Invoke REST API:** Llamar a un webhook antes de deploy
   - En Approvals and checks → Invoke REST API
   - URL de tu servicio de validación

### **Paso 4: Configurar Variables Secretas**

Ve a **Pipelines** → Tu pipeline → **Edit** → **Variables**

Agrega estas variables como **secretas** (🔒):

| Variable | Valor | Secreto |
|----------|-------|---------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/db` | ✓ |
| `DB_USER` | Tu usuario de MongoDB Atlas | ✓ |
| `DB_PASSWORD` | Tu contraseña de MongoDB Atlas | ✓ |
| `DB_HOST` | `cluster0.xyz.mongodb.net` | ✗ |
| `DB_NAME` | `app` o tu nombre de BD | ✗ |
| `DB_OPTIONS` | `retryWrites=true&w=majority` | ✗ |
| `TOKEN_KEY` | Tu secret key para JWT | ✓ |

### **Paso 5: Crear/Configurar Azure Resources (Solo para Producción)**

**NOTA:** Solo creamos recursos de Azure para **Producción**. La imagen de desarrollo se sube a Docker Hub pero NO se despliega a Azure automáticamente.

#### Crear recursos de Producción:

```bash
# 1. Crear resource group
az group create --name rg-devops-prod --location westus

# 2. Crear App Service Plan (Linux, B1 tier)
az appservice plan create \
  --name plan-devops-prod \
  --resource-group rg-devops-prod \
  --is-linux \
  --sku B1

# 3. Crear Web App
az webapp create \
  --name webapp-devops-prod \
  --resource-group rg-devops-prod \
  --plan plan-devops-prod \
  --deployment-container-image-name YOUR_USERNAME/devops-project-prod:latest

# 4. Verificar que se creó correctamente
az webapp show --name webapp-devops-prod --resource-group rg-devops-prod --output table
```

#### Para probar la imagen de Desarrollo localmente:

```bash
# Descargar la imagen de desarrollo desde Docker Hub
docker pull YOUR_USERNAME/devops-project-dev:dev

# Ejecutar localmente
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_uri" \
  YOUR_USERNAME/devops-project-dev:dev
```

### **Paso 6: Configurar el Pipeline en Azure DevOps**

1. Ve a **Pipelines** → **New pipeline**
2. Selecciona tu repositorio
3. Selecciona **Existing Azure Pipelines YAML file**
4. Busca `/azure-pipelines-unified.yml`
5. Click **Run**

---

## 🎬 Flujo de Trabajo

### Desarrollo en rama `dev`

```bash
# 1. Crear feature branch desde dev
git checkout dev
git pull origin dev
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commit
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Push y crear PR hacia dev
git push origin feature/nueva-funcionalidad
# Crear PR en Azure DevOps hacia 'dev'

# 4. El pipeline se ejecuta:
#    ✓ Valida tests
#    ✗ NO construye imagen (es PR)

# 5. Merge del PR a dev
# El pipeline se ejecuta:
#    ✓ Valida tests
#    ✓ Construye imagen: YOUR_USERNAME/devops-project-dev:dev
#    ✓ Despliega a Azure Dev
```

### Promoción a Producción

```bash
# 1. Crear PR de dev → main
git checkout dev
git pull origin dev
# En Azure DevOps: Crear PR de dev → main

# 2. El pipeline se ejecuta:
#    ✓ Valida tests
#    ✗ NO construye imagen (es PR)

# 3. Merge del PR a main
# El pipeline se ejecuta:
#    ✓ Valida tests
#    ✓ Construye imagen: YOUR_USERNAME/devops-project-prod:latest
#    ✓ Despliega a Azure Production
```

---

## 📊 Visualización del Pipeline

```
┌─────────────────────────────────────────────────┐
│  PR hacia main/dev                              │
│  ✓ Validate (tests + coverage)                 │
│  ✗ BuildAndPush (skipped)                      │
│  ✗ Deploy (skipped)                            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Push a dev                                     │
│  ✓ Validate (tests + coverage)                 │
│  ✓ BuildAndPush → devops-project-dev:dev       │
│  ✗ Deploy (NO se despliega a Azure)            │
│  💡 Imagen disponible en Docker Hub             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Push a main                                    │
│  ✓ Validate (tests + coverage)                 │
│  ✓ BuildAndPush → devops-project-prod:latest   │
│  ⏸️  DeployProduction → WAITING FOR APPROVAL    │
│     👤 Aprobador revisa y aprueba/rechaza       │
│  ✓ Deploy a Azure Prod (si se aprueba)         │
└─────────────────────────────────────────────────┘
```

---

## 🏷️ Tags de Imágenes Docker

### Producción (main)
- `YOUR_USERNAME/devops-project-prod:latest` - Última versión
- `YOUR_USERNAME/devops-project-prod:production` - Tag de producción
- `YOUR_USERNAME/devops-project-prod:123` - Build ID específico

### Desarrollo (dev)
- `YOUR_USERNAME/devops-project-dev:dev` - Versión de desarrollo
- `YOUR_USERNAME/devops-project-dev:latest-dev` - Última versión dev
- `YOUR_USERNAME/devops-project-dev:123` - Build ID específico

---

## 🔍 Verificar que funciona

### Ver imágenes en Docker Hub

```bash
# Producción
docker pull YOUR_USERNAME/devops-project-prod:latest

# Desarrollo
docker pull YOUR_USERNAME/devops-project-dev:dev
```

### Ver deployments en Azure

```bash
# Producción
az webapp show --name webapp-devops-prod --resource-group rg-devops-prod

# Desarrollo
az webapp show --name webapp-devops-dev --resource-group rg-devops-dev
```

---

## 🐛 Troubleshooting

### Tests fallan en el pipeline pero pasan localmente

```bash
# Asegúrate de tener las variables de entorno configuradas en Azure DevOps
# Ve a Pipeline → Edit → Variables
```

### Docker push falla

```bash
# Verifica tu service connection de Docker Hub
# Project Settings → Service connections → Docker
# Asegúrate que el nombre coincide con dockerConnection en el YAML
```

### Deploy falla

```bash
# Verifica que los resource groups existen:
az group list --output table

# Verifica que las web apps existen:
az webapp list --output table
```

---

## 🛡️ Validación de Coverage

El pipeline **NO construirá ni desplegará** si el coverage está por debajo del mínimo:

### Requisitos Mínimos:
- ✅ **Statements:** >= 40%
- ✅ **Lines:** >= 40%
- ✅ **Functions:** >= 30%
- ✅ **Branches:** >= 30%

### ¿Qué pasa si el coverage es bajo?

```
Stage: Validate
  ✓ Instalar dependencias
  ✓ Ejecutar tests
  ❌ Validate Coverage >= 40% (FAILED)

Pipeline detenido ❌
⚠️  BuildAndPush NO se ejecuta
⚠️  Deploy NO se ejecuta
```

### ¿Cómo arreglarlo?

1. **Ver el coverage localmente:**
   ```bash
   npm test
   # Abre: coverage/index.html
   ```

2. **Añadir más tests** hasta llegar al 40%

3. **Volver a hacer push:**
   ```bash
   git add .
   git commit -m "test: increase coverage to 40%"
   git push
   ```

---

## 📝 Notas Importantes

1. **PRs NO construyen imágenes** - Solo validan código y coverage
2. **Solo push a main/dev construye imágenes** - Después de merge (si coverage >= 40%)
3. **Diferentes imágenes para cada ambiente** - Producción y desarrollo separados
4. **Solo MAIN despliega a Azure** - La rama dev solo sube imagen a Docker Hub
5. **🔐 Deploy a producción REQUIERE APROBACIÓN MANUAL** - El pipeline se pausa y espera tu aprobación
6. **Imagen ya está en Docker Hub antes de aprobar** - Incluso si rechazas, la imagen ya fue publicada
7. **Imagen dev disponible en Docker Hub** - Puedes descargarla y ejecutarla localmente
8. **Variables secretas** - NUNCA las commits al repositorio
9. **Coverage mínimo obligatorio** - 40% statements/lines, 30% functions/branches

---

## ✅ Checklist de Setup

- [ ] Edité `azure-pipelines-unified.yml` con mis nombres de imagen Docker
- [ ] Configuré Docker Hub service connection en Azure DevOps
- [ ] Configuré Azure service connection (solo para deploy de producción)
- [ ] **Creé environment `production` con aprobaciones manuales** 🔐
- [ ] Agregué aprobadores al environment (yo u otros miembros del equipo)
- [ ] Agregué variables secretas (MONGODB_URI, DB_PASSWORD, TOKEN_KEY, etc.)
- [ ] Creé el resource group de PRODUCCIÓN en Azure (rg-devops-prod)
- [ ] Creé la web app de PRODUCCIÓN en Azure (webapp-devops-prod)
- [ ] Configuré el pipeline en Azure DevOps
- [ ] Hice un PR de prueba para verificar que funciona
- [ ] Verifiqué que la imagen dev se sube a Docker Hub (sin deploy a Azure)
- [ ] Probé el flujo de aprobación haciendo push a main
