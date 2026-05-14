# LASER CHESS - CLIENTE WEB [![Frontend CI](https://github.com/gracehopper/laser_chess_web/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/gracehopper/laser_chess_web/actions)

Cliente web del juego de mesa online Laser Chess.

## Estructura del proyecto

```
laser-chess-web/
├── public/                            # Recursos públicos estáticos
├── src/
│   ├── app/
│   │
│   │   ├── constants/                 # Constantes globales
│   │   │   ├── app.const.ts
│   │   │   ├── boards.ts
│   │   │   └── time.mode.ts
│   │
│   │   ├── features/                  # Pantallas principales de la aplicación
│   │   │   ├── customize/             # Personalización de tablero y piezas
│   │   │   ├── game/                  # Pantalla de partida
│   │   │   ├── history/               # Historial de partidas
│   │   │   ├── history-hall/          # Replays e historial avanzado
│   │   │   ├── home/                  # Pantalla principal
│   │   │   ├── login/                 # Inicio de sesión
│   │   │   ├── signin/                # Registro de usuario
│   │   │   ├── ranking/               # Ranking global
│   │   │   ├── settings/              # Configuración de usuario
│   │   │   ├── shop/                  # Tienda de items y skins
│   │   │   └── social/                # Amigos, retos y partidas pausadas
│   │
│   │   ├── model/                     # Modelos de dominio y comunicación
│   │   │   ├── auth/                  # Modelos de autenticación
│   │   │   ├── game/                  # Modelos de partida
│   │   │   ├── notifications/         # Notificaciones y eventos
│   │   │   ├── ranking/               # Modelos de ranking
│   │   │   ├── rating/                # ELO y estadísticas
│   │   │   ├── remote/                # Comunicación HTTP y WebSocket
│   │   │   ├── shop/                  # Modelos de tienda
│   │   │   ├── social/                # Modelos sociales y amistades
│   │   │   ├── token/                 # Gestión del token
│   │   │   └── user/                  # Modelos de usuario
│   │
│   │   ├── repository/                # Acceso centralizado a datos
│   │   │   ├── auth-repository.ts
│   │   │   ├── customize-repository.ts
│   │   │   ├── friend-repository.ts
│   │   │   ├── game-repository.ts
│   │   │   ├── ranking-repository.ts
│   │   │   ├── shop-repository.ts
│   │   │   └── user-repository.ts
│   │
│   │   ├── services/                  # Lógica de negocio y control de partida
│   │   │   ├── board-action.ts
│   │   │   ├── challenge-flow.ts
│   │   │   ├── challenge-manager.ts
│   │   │   ├── game-logic-service.ts
│   │   │   ├── history-service.ts
│   │   │   └── timer-service.ts
│   │
│   │   ├── shared/                    # Componentes reutilizables
│   │   │   ├── board/                 # Renderizado del tablero
│   │   │   ├── laser/                 # Visualización del láser
│   │   │   ├── layout/                # Layout principal
│   │   │   ├── notification-game/     # Notificaciones en partida
│   │   │   ├── popups/                # Pop-ups
│   │   │   ├── sidebar/               # Barra lateral
│   │   │   └── top-row/               # Barra superior
│   │
│   │   ├── tests/                     # Tests funcionales y validadores
│   │   ├── utils/                     # Utilidades globales y estados
│   │
│   │   ├── app.config.ts              # Configuración principal Angular
│   │   ├── app.routes.ts              # Sistema de rutas
│   │   ├── app.css                    # Estilos globales
│   │   └── app.html                   # Layout raíz
│
├── deployment/                        # Configuración de despliegue
│   ├── Dockerfile
│   ├── docker-compose.yaml
│   └── nginx.conf
│
└── .github/                           # GitHub Actions y CI/CD
```

## Tecnologías

- **Framework:** Angular
- **Lenguaje:** TypeScript
- **UI:** Angular Material
- **Comunicación en red:** HttpClient + WebSocket + SSE
- **Tests:** Vitest + Jasmine
- **Despliegue:** Docker + Nginx

## Requisitos

- Node.js 20 o +
- Angular CLI
- Docker

## Puesta en marcha

```bash
# Clonar el repositorio
git clone https://github.com/gracehopper/laser_chess_web.git
cd laser_chess_web

# Instalar dependencias
npm install

# Ejecutar entorno de desarrollo
npm start

# Ejecutar tests unitarios
npm test
```

## CI/CD

El pipeline de GitHub Actions se ejecuta en cada push y pull request sobre las ramas principales y realiza los siguientes pasos:

1. Instalar dependencias
2. Ejecutar tests unitarios
3. Compilar el proyecto
4. Validar el frontend
