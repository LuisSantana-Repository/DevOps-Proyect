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

1. **Validate** - Ejecuta tests y coverage (siempre)
2. **BuildAndPush** - Construye y sube imagen Docker (solo en push, no en PR)
   - `main` → `YOUR_USERNAME/devops-project-prod:latest`
   - `dev` → `YOUR_USERNAME/devops-project-dev:dev`
3. **DeployProduction** - Despliega a Azure (solo main)
4. **DeployDevelopment** - Despliega a Azure (solo dev)

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

### **Paso 3: Configurar Variables Secretas**

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

### **Paso 4: Crear/Configurar Azure Resources (Opcional - para deploy)**

#### Para Producción:

```bash
# Crear resource group
az group create --name rg-devops-prod --location westus

# Crear App Service Plan
az appservice plan create \
  --name plan-devops-prod \
  --resource-group rg-devops-prod \
  --is-linux \
  --sku B1

# Crear Web App
az webapp create \
  --name webapp-devops-prod \
  --resource-group rg-devops-prod \
  --plan plan-devops-prod \
  --deployment-container-image-name YOUR_USERNAME/devops-project-prod:latest
```

#### Para Desarrollo:

```bash
# Crear resource group
az group create --name rg-devops-dev --location westus

# Crear App Service Plan
az appservice plan create \
  --name plan-devops-dev \
  --resource-group rg-devops-dev \
  --is-linux \
  --sku B1

# Crear Web App
az webapp create \
  --name webapp-devops-dev \
  --resource-group rg-devops-dev \
  --plan plan-devops-dev \
  --deployment-container-image-name YOUR_USERNAME/devops-project-dev:dev
```

### **Paso 5: Configurar el Pipeline en Azure DevOps**

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
│  ✓ DeployDevelopment → Azure Dev               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Push a main                                    │
│  ✓ Validate (tests + coverage)                 │
│  ✓ BuildAndPush → devops-project-prod:latest   │
│  ✓ DeployProduction → Azure Prod               │
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

## 📝 Notas Importantes

1. **PRs NO construyen imágenes** - Solo validan código
2. **Solo push a main/dev construye imágenes** - Después de merge
3. **Diferentes imágenes para cada ambiente** - Producción y desarrollo separados
4. **Variables secretas** - NUNCA las commits al repositorio
5. **Coverage mínimo** - 40% statements, 30% branches (configurado en jest.config.js)

---

## ✅ Checklist de Setup

- [ ] Edité `azure-pipelines-unified.yml` con mis nombres de imagen
- [ ] Configuré Docker Hub service connection en Azure DevOps
- [ ] Configuré Azure service connection (si voy a desplegar)
- [ ] Agregué variables secretas (MONGODB_URI, DB_PASSWORD, TOKEN_KEY, etc.)
- [ ] Creé los resource groups en Azure (si voy a desplegar)
- [ ] Creé las web apps en Azure (si voy a desplegar)
- [ ] Configuré el pipeline en Azure DevOps
- [ ] Hice un PR de prueba para verificar que funciona
