# Pull Request: 3-Tier Dashboard-Architektur

## Overview

Dieser PR fuhrt eine vollstandige 3-Tier Dashboard-Architektur mit React, Express.js und PostgreSQL ein.

---

## What (Was wurde gemacht)

### 1. Datenbank (PostgreSQL)
- PostgreSQL 16 mit Docker-Compose
- Tabellen: `projects`, `tickets`, `todos`, `kanban_config`
- UUID-Primarschlussel mit automatischer Generierung
- Trigger fur automatisches `updated_at`-Update
- Indexes fur optimierte Queries
- Default Kanban-Konfiguration

### 2. Backend (Express.js + TypeScript)
- RESTful API mit vollstandigem CRUD
- Entity Models mit PostgreSQL (node-postgres)
- Routes & Controllers fur:
  - Projects (`/api/projects`)
  - Tickets (`/api/tickets`)
  - Todos (`/api/todos`)
  - Kanban Config (`/api/kanban-config`)
- CORS-Unterstutzung
- TypeScript mit strikten Typen

### 3. Frontend (React + TypeScript + Tailwind)
- Vite-basierte React-App
- Zustand fur State Management
- Axios API-Clients
- Komponenten:
  - **Kanban Board**: Drag & Drop zwischen beliebigen Spalten
  - **Project Management**: CRUD mit Farbauswahl
  - **Todo List**: Checkbox-Status mit Filter
- Tailwind CSS fur Styling

### 4. Docker-Setup
- Multi-Container mit docker-compose:
  - `postgres` (Port 5432)
  - `backend` (Port 3001, Hot Reload)
  - `frontend` (Port 3000, Nginx)

---

## Why (Warum)

- **Customizable Kanban**: Benutzerdefinierbare Spalten ermoglichen flexible Workflows
- **Trennung der Belange**: 3-Tier-Architektur fur bessere Wartbarkeit
- **Type Safety**: TypeScript im Frontend und Backend reduziert Fehler
- **Containerisierung**: Docker sorgt fur konsistente Entwicklungsumgebungen
- **Zustand-Management**: Zustand bietet einfaches, performantes State-Management

---

## How (Wie wurde es umgesetzt)

### Git Workflow
- Feature-Branches fur jede Komponente
- Conventional Commits mit klarer Semantik
- 13 Commits in logischer Reihenfolge

### Architektur-Entscheidungen
1. **Kanban Config Table**: Speichert Spalten als Array, erlaubt dynamische Konfiguration
2. **Ticket Column Name**: Separate Spalte fur Kanban-Positionierung
3. **Zustand Stores**: Ein Store pro Domain (Projects, Tickets, Todos, KanbanConfig)
4. **Drag & Drop**: Native HTML5 Drag & Drop API (keine externe Library)

### API-Design
```
GET    /api/projects       # Liste alle Projekte
POST   /api/projects       # Erstelle Projekt
PUT    /api/projects/:id   # Update Projekt
DELETE /api/projects/:id   # Losche Projekt

GET    /api/tickets        # Liste alle Tickets
POST   /api/tickets        # Erstelle Ticket
PUT    /api/tickets/:id    # Update Ticket (inkl. column_name fur Kanban)
DELETE /api/tickets/:id    # Losche Ticket

GET    /api/todos          # Liste alle Todos
POST   /api/todos          # Erstelle Todo
PUT    /api/todos/:id      # Update Todo (inkl. completed Status)
DELETE /api/todos/:id      # Losche Todo

GET    /api/kanban-config  # Lade Kanban-Spalten-Konfiguration
```

---

## Commits

| Commit | Beschreibung |
|--------|--------------|
| `b8a9055` | chore(setup): initialize project structure with docker-compose |
| `af4960d` | feat(db): create PostgreSQL schema with projects, tickets, todos tables |
| `e5f95cb` | feat(backend): implement Express server with project routes |
| `87632dc` | feat(backend): add ticket CRUD operations |
| `a8a468f` | feat(backend): add todo CRUD operations |
| `7fb3e24` | feat(backend): add kanban configuration endpoints |
| `3177e8a` | feat(frontend): create React app with routing |
| `742b3ef` | feat(frontend): implement project management UI |
| `c75cf46` | feat(frontend): implement customizable Kanban board |
| `2bee091` | feat(frontend): add todo list functionality |
| `74f5cee` | feat(docker): configure multi-container setup |

---

## Testing

### Manuelles Testing
1. `cp .env.example .env`
2. `docker-compose up -d`
3. Frontend: http://localhost:3000
4. Backend: http://localhost:3001/health
5. Projekte erstellen/bearbeiten/loschen
6. Tickets mit Drag & Drop zwischen Spalten verschieben
7. Kanban-Spalten uber "Configure Columns" anpassen
8. Todos erstellen und als erledigt markieren

---

## Checklist

- [x] .gitignore mit node_modules/, dist/, build/, .env
- [x] Feature-Branches verwendet (feature/*)
- [x] Conventional Commits Format
- [x] TypeScript im Frontend und Backend
- [x] Docker-Compose mit 3 Services
- [x] PostgreSQL mit Init-Skript
- [x] REST API vollstandig implementiert
- [x] Kanban Board mit Drag & Drop
- [x] Customizable Spalten
- [x] README mit Setup-Anleitung

---

## Notes

- Keine Emojis im Code (wie gewunscht)
- Strikt getrennte Verantwortlichkeiten zwischen den Layern
- Zustand-Stores bieten saubere State-Verwaltung
- Drag & Drop funktioniert ohne externe Libraries

---

Ready for merge into main!
