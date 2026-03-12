# Deployment auf Proxmox

## Voraussetzungen

- Docker und Docker Compose installiert
- Git installiert

## Schnellstart

```bash
# 1. Repository klonen
git clone <repo-url>
cd dashboard-3tier

# 2. Environment-Variablen setzen
cp .env.example .env
# .env editieren und Passwörter ändern!

# 3. Container bauen und starten
docker compose up -d --build

# 4. Logs prüfen
docker compose logs -f
```

## Wichtige Änderungen für Proxmox

### Backend (fixed)
- Lauscht jetzt explizit auf `0.0.0.0:3001` (alle Interfaces)
- Vorher: Nur auf localhost, von außen nicht erreichbar

### Frontend (fixed)
- Nutzt jetzt relative URL `/api` statt `http://localhost:3001/api`
- Vorher: Browser hat versucht localhost:3001 zu erreichen (fehlgeschlagen)
- Nun: Nginx leitet `/api` automatisch ans Backend weiter

### Nginx Reverse Proxy (bereits konfiguriert)
- `/api` → Backend (Port 3001)
- `/socket.io` → Backend (WebSockets)
- `/uploads` → Backend (Dateien)

## Ports

- `3000` - Frontend (Nginx)
- `3001` - Backend (API)
- `5432` - PostgreSQL (intern)

## Zugriff

Nach dem Start erreichbar unter:
- `http://<proxmox-ip>:3000` - Dashboard
- `http://<proxmox-ip>:3001/health` - Backend Health Check

## Fehlerbehebung

### Container prüfen
```bash
docker compose ps
```

Sollte zeigen:
```
backend    0.0.0.0:3001->3001/tcp
frontend   0.0.0.0:3000->80/tcp
```

### Backend-Verbindung testen
```bash
curl http://localhost:3001/health
```

### Logs ansehen
```bash
# Alle Services
docker compose logs -f

# Nur Backend
docker compose logs -f backend

# Nur Frontend
docker compose logs -f frontend
```

### Container neu bauen (nach Code-Änderungen)
```bash
docker compose down
docker compose up -d --build
```

## Produktion

Für echte Produktion:
1. Starke Passwörter in `.env` setzen
2. JWT_SECRET ändern
3. Nginx mit SSL/TLS (Let's Encrypt) konfigurieren
4. Firewall-Regeln setzen (nur 80/443 nach außen)
