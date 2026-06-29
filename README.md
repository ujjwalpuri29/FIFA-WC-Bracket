# FIFA World Cup 2026 Knockout Bracket

An interactive FIFA World Cup 2026 knockout bracket built with HTML, CSS, and vanilla JavaScript. This page allows users to simulate the tournament, advance teams through each round, visualize progression with connector paths, and export the completed bracket.

## Features

* Interactive Round of 32 through Final bracket
* Double-click a team to advance it to the next round
* Country flags displayed automatically
* Manual team editing with automatic flag detection
* Winner highlighting and advancement animations
* SVG connector paths showing tournament progression
* Print-friendly layout
* Data-driven bracket loaded from JSON



## Data Model

The bracket is completely driven by `matches.json`.

Each match contains:

```json
{
    "id": "m1",
    "num": "M1",
    "time": "2026-06-28T19:00:00Z",
    "venue": "SoFi Stadium, LA",
    "col": "col-r32-l",
    "nextMatch": "r1",
    "nextSlot": 1
}
```

### Required Fields

| Field       | Description                     |
| ----------- | ------------------------------- |
| `id`        | Unique match identifier         |
| `time`      | Display kickoff time in ISO-8601 timestamps   |
| `venue`     | Match venue                     |
| `col`       | Target bracket column           |
| `nextMatch` | Match that receives the winner  |
| `nextSlot`  | Slot (1 or 2) in the next match |

### Semifinals

Semifinals additionally contain:

```json
{
    "loserMatch": "3RD",
    "loserSlot": 1
}
```

which automatically routes losing teams into the Third Place match.


## Advancement

Double-clicking a team:

1. Marks it as the winner
2. Highlights the winning row
3. Plays an advancement animation
4. Copies the team into the next round
5. Sends semifinal losers into the Third Place match



## Controls

### Double Click

Advances a selected team.

### Manual Editing

Typing a team name:

* updates the displayed flag
* can update previous-round winner highlighting

### Reset

The reset button:

* clears every round
* removes winner highlights
* removes generated flags
* reloads Round of 32 teams



## Printing

The print stylesheet:

* removes controls
* preserves bracket layout
* optimizes colors


## Future Improvements

* Persist brackets using Local Storage
* Shareable bracket links
* Automatic connector highlighting for selected winners
* Tournament statistics
* Drag-and-drop team movement
* Mobile-friendly layout
* Live match integration



## Technologies

* HTML5
* CSS3
* JavaScript
* FlagCDN
* Google Fonts


## License

Created for educational and personal use. FIFA logos, names, and branding remain the property of FIFA.
