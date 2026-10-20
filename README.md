# 🛡️ PROYECTO SENTINEL (PCRA)
> **Plataforma de Concienciación y Respuesta a Amenazas**  
> *"Convertimos empleados en el firewall humano de las pymes"*

🎮 **Demo interactiva online:** [https://nachoya19.github.io/](https://nachoya19.github.io/)

---

## 🕹️ Acerca de la Presentación
Esta aplicación web interactiva transforma la presentación del **Sprint 1** del Proyecto Sentinel en una experiencia arcade retro / Cyber-CRT inmersiva de los años 80-90.

### ✨ Características Principales
* **Estética Cyber-CRT Arcade:** Filtros scanline conmutables, resplandor de fósforo (*bloom/glow*) y paleta ciberpunk basada en HSL tailoreada.
* **Motor de Audio Retro Procedimental (Web Audio API):**
  * Salto a *HACKED* con ráfaga de glitch digital y sub-bass drop.
  * Sirena de alarma de ciberseguridad continua en Stage 02 modulada por LFO.
  * Fanfarria triunfal de 8-bits en Stage 14 (Mission Success).
  * Sonidos de pulsación de botones y navegación tipo blip/coin.
* **Sistema de Ponentes Arcade con Chroma-Key en Tiempo Real:**
  * Recorte dinámico de sprite sheets y eliminación de fondo verde en canvas.
  * Sincronización automática de turno de palabra (Player 1 / Player 2) según la diapositiva.
* **HUD y Navegación:**
  * Barra de vida/escudo segmentada interactiva.
  * Contador de puntuación arcade y cronómetro de sesión.
  * Modal de mapa de niveles (*Stage Select*).
  * Soporte completo para pantalla completa y atajos de teclado (`←` / `→`, `Espacio`, `Enter`).

---

## 👥 Equipo y Roles Tácticos

| Miembro | Rol Ágil | Especialidad | Perfil DISC |
| :--- | :--- | :--- | :--- |
| **Iván Navarrete** | Product Owner | Oratoria y coordinación grupal | `I · ENFP-T` |
| **Nicolás** | Scrum Master | Seguridad y documentación | `S · ISFJ-T` |
| **Nacho Oya** | Desarrollador | Programación y tecnologías web | `S · ESTP-T` |
| **Mario Seoane** | Diseñador QA | Experiencia de usuario y pruebas | `S · ISFJ-T` |
| **Miguel** | Desarrollador | Lógica y arquitectura backend | `C · INTJ-A` |
| **Alberto** | Desarrollador | Implementación e integración | `D · ENTJ-A` |

---

## 📂 Estructura del Repositorio

```text
├── index.html          # Aplicación web completa y autónoma
├── assets/
│   ├── avatars/        # Sprites y retratos de los miembros del equipo
│   └── sprites/        # Sprite sheets de los ponentes para animación arcade
├── docs/               # Documentación y memoria del proyecto en PDF
├── .gitignore          # Filtro de archivos temporales
└── README.md           # Información general y documentación
```

---

## 🚀 Ejecución en Local

Puedes abrir directamente el archivo `index.html` con cualquier navegador web moderno, o ejecutar un servidor estático local:

```bash
# Servidor HTTP con Python 3
python3 -m http.server 8080
```
Visita luego `http://localhost:8080` en tu explorador.
