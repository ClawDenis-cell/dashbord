# Dashboard 3-Tier Application

Eine professionelle 3-Tier Dashboard-Anwendung mit React (Frontend), Express.js (Backend) und PostgreSQL (Datenbank).

## Features

- 🎨 **Customizable Kanban Board**: Beliebig viele Spalten mit individuellen Namen
- 📋 **Projekt-Management**: CRUD-Operationen für Projekte
- 🎫 **Ticket-System**: Tickets mit Status und Kanban-Positionierung
- ✅ **Todo-Liste**: Separate Aufgabenverwaltung

## Architektur

```
Frontend (Port 3000)
    ↕
Backend API (Port 3001)
    ↕
PostgreSQL (Port 5432)
```

## Schnellstart

### Voraussetzungen
- Docker & Docker Compose
- Node.js 20+ (für lokale Entwicklung)

### Setup

1. Environment-Datei erstellen:
   ```bash
   cp .env.example .env
   ```

2. Docker-Container starten:
   ```bash
   docker-compose up -d
   ```

3. Anwendung aufrufen:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Datenbank-Schema

Die Datenbank wird automatisch initialisiert mit:
- `projects` - Projekte mit Name, Beschreibung und Farbe
- `tickets` - Tickets mit Status, Priorität und Kanban-Spalte
- `todos` - Separate Aufgabenliste
- `kanban_config` - Konfiguration der Kanban-Spalten

## API-Endpunkte

### Projekte
- `GET /api/projects` - Alle Projekte
- `POST /api/projects` - Projekt erstellen
- `PUT /api/projects/:id` - Projekt aktualisieren
- `DELETE /api/projects/:id` - Projekt löschen

### Tickets
- `GET /api/tickets` - Alle Tickets
- `POST /api/tickets` - Ticket erstellen
- `PUT /api/tickets/:id` - Ticket aktualisieren
- `DELETE /api/tickets/:id` - Ticket löschen

### Todos
- `GET /api/todos` - Alle Todos
- `POST /api/todos` - Todo erstellen
- `PUT /api/todos/:id` - Todo aktualisieren
- `DELETE /api/todos/:id` - Todo löschen

### Kanban-Konfiguration
- `GET /api/kanban-config` - Spalten-Konfiguration laden

## Entwicklung

### Lokales Frontend-Development
```bash
cd frontend
npm install
npm run dev
```

### Lokales Backend-Development
```bash
cd backend
npm install
npm run dev
```

## Lizenz

MIT
