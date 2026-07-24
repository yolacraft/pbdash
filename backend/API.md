# PBDash Backend – API Dokumentation

Diese Dokumentation richtet sich an Frontend-Entwickler:innen und beschreibt alle
verfügbaren HTTP-Endpunkte, die zurückgelieferten Datenstrukturen sowie das
Verhalten des Backends.

## Überblick

Das Backend sammelt Live-Speedrun-Daten (Minecraft RSG) von
[paceman.gg](https://paceman.gg) ein und stellt sie für ein "PBDash"-Event
aufbereitet über eine REST-API bereit. Die Daten werden serverseitig alle
2 Sekunden aktualisiert (nur während das Event läuft).

- **Protokoll:** HTTP (REST)
- **Format:** JSON (`Content-Type: application/json`)
- **Methoden:** ausschließlich `GET`
- **Authentifizierung:** keine

> **Hinweis (CORS):** Es ist aktuell **keine** CORS-Konfiguration hinterlegt.
> Wenn das Frontend von einer anderen Origin aus zugreift, muss serverseitig
> noch CORS erlaubt werden (z. B. `@CrossOrigin` oder eine globale Config).

---

## Wichtige Konzepte

### Zeiten (`igt` / `rta`)

Alle Zeitangaben in Splits und Paces sind **Ganzzahlen in Millisekunden**.

- `igt` = *In-Game Time* (die für das Ranking relevante Zeit)
- `rta` = *Real Time Attack* (reale Zeit inkl. Pausen/Ladezeiten)

Beispiel: `90000` = 90 Sekunden = 1:30.

### Splits (Meilensteine eines Runs)

Ein Run besteht aus einer Liste von Splits. Jeder Split markiert das Erreichen
eines Meilensteins. Mögliche Werte für `split`:

| Wert (`split`)      | Bedeutung                          | Fortschritt |
|---------------------|------------------------------------|:-----------:|
| `ENTER_NETHER`      | Nether betreten                    | 1 (früh)    |
| `ENTER_BASTION`     | Bastion betreten                   | 2           |
| `ENTER_FORTRESS`    | Fortress betreten                  | 3           |
| `FINDING_STRONGHOLD`| Auf dem Weg zur Stronghold (Portal)| 4           |
| `FOUND_STRONGHOLD`  | Stronghold gefunden                | 5           |
| `ENTER_END`         | End betreten                       | 6           |
| `COMPLETED_RUN`     | Run abgeschlossen (Credits)        | 7 (Ende)    |

Der **letzte** Split in der `splits`-Liste ist der aktuell erreichte Fortschritt
eines Runs.

---

## Datenmodelle

### `Split`
```jsonc
{
  "split": "ENTER_NETHER", // einer der Split-Werte (siehe Tabelle oben)
  "igt": 90000,            // In-Game Time in ms
  "rta": 95000             // Real Time in ms
}
```

### `Run`
```jsonc
{
  "playerName": "Steve",       // Anzeigename des Runners
  "gameVersion": "1.16.1",     // Minecraft-Version
  "worldID": "abc123",         // eindeutige World-ID (identifiziert den Run)
  "cheated": false,            // von paceman als gecheatet markiert
  "hidden": false,             // vom Runner versteckt
  "splits": [ /* Split[] */ ], // chronologische Liste der erreichten Splits
  "liveStreamed": "twitchName",// Twitch-Account, falls live gestreamt (sonst null)
  "active": true,              // ob der Run gerade läuft
  "timestamp": 1721817600000   // letzte Aktualisierung (Unix-ms)
}
```

### `Speedrunner`
```jsonc
{
  "name": "Steve",
  "twitch": "twitchName",
  "pbpace": {                  // persönliche Bestzeiten pro Split (ms)
    "ENTER_NETHER": 80000,
    "ENTER_BASTION": 120000,
    "ENTER_FORTRESS": 150000,
    "FINDING_STRONGHOLD": 300000,
    "FOUND_STRONGHOLD": 350000,
    "ENTER_END": 400000,
    "COMPLETED_RUN": 550000
  },
  "runs": [ /* Run[] */ ]
}
```

---

## Endpunkte

### 1. Event-Startzeit

```
GET /api/getEventStart
```

Liefert Start- und Endzeitpunkt des PBDash-Events sowie ob es gerade läuft.
Zeiten sind ISO-8601 mit Offset (UTC-normalisiert, z. B. `Z`).

**Response `200 OK`**
```jsonc
{
  "eventStart": "2026-07-24T22:00:00Z", // Start (ISO-8601)
  "eventEnd": "2026-07-26T21:59:00Z",   // Ende (ISO-8601)
  "active": false                        // true, wenn jetzt zwischen Start & Ende
}
```

> Die Zeiten sind serverseitig hardcodiert (Zeitzone Europe/Berlin) und werden
> hier nach UTC konvertiert ausgegeben. Zum Anzeigen im FE ggf. in die lokale
> Zeitzone umrechnen.

---

### 2. Hauptseiten-Daten (Leaderboard + aktuelle Paces)

```
GET /api/getMainPageStuff
```

Der wichtigste Endpunkt für die Startseite. Kombiniert das **Leaderboard**
(schnellster abgeschlossener Run pro Runner) mit den **aktiven Paces**
(laufende Runs).

**Response `200 OK`**
```jsonc
{
  "leaderboard": [
    {
      "name": "Steve",   // Runner
      "time": 550000,    // beste Completion-Zeit (igt, ms) — aufsteigend sortiert
      "pb": true         // true, wenn dieser Run <= persönlicher PB ist
    }
  ],
  "paces": [
    {
      "name": "Alex",
      "twitch": "alexTwitch",     // kann null sein
      "time": 90000,              // igt des zuletzt erreichten Splits (ms)
      "split": "ENTER_NETHER",    // aktuell erreichter Split
      "splits": [ /* Split[] */ ] // alle bisherigen Splits des Runs
    }
  ]
}
```

**Sortierung:**
- `leaderboard`: nach `time` aufsteigend (schnellster zuerst).
- `paces`: erst nach Fortschritt (am weitesten fortgeschritten zuerst),
  dann nach `time` aufsteigend.

---

### 3. Aktive Runs

```
GET /api/getActiveRuns
```

Liefert alle aktuell laufenden Runs als flache Liste.

**Response `200 OK`** → Array von [`Run`](#run) (nur solche mit `active: true`).

---

### 4. Alle Runs

```
GET /api/getAllRuns
```

Liefert **alle** gespeicherten Runs aller Runner (aktiv und abgeschlossen).

**Response `200 OK`** → Array von [`Run`](#run).

---

### 5. Speedrunner-Liste

```
GET /api/getSpeedrunners
```

Liefert alle Runner inkl. ihrer PB-Paces und aller Runs.

**Response `200 OK`** → Array von [`Speedrunner`](#speedrunner).

---

### 6. Run-Statistiken

```
GET /api/getRunStatistics
```

Aggregierte Kennzahlen über alle Runs.

**Response `200 OK`**
```jsonc
{
  "enter": 42,          // Gesamtzahl der Runs (mit mind. einem Split)
  "completions": 7,     // Anzahl abgeschlossener Runs (COMPLETED_RUN)
  "avg": 88000.0        // durchschnittliche igt des ersten Splits (ms, float)
}
```

---

## Verhalten außerhalb des Events

Außerhalb des Event-Zeitfensters (`getEventStart.active == false`) pausiert das
Backend das Einlesen neuer Live-Daten. Die datenliefernden Endpunkte antworten
weiterhin, geben aber ggf. leere Listen oder nur den zuletzt gespeicherten Stand
zurück. Das Frontend sollte daher mit **leeren Arrays** umgehen können.

## Fehlerverhalten

Es sind keine expliziten Fehler-Responses definiert. Bei Serverfehlern liefert
Spring standardmäßig `500 Internal Server Error` mit einem JSON-Fehlerobjekt
(`timestamp`, `status`, `error`, `path`). Nicht existierende Pfade liefern
`404 Not Found`.
