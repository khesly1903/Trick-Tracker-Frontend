# Frontend Feature Notes — Stage & Level Changes

## Summary

Two major changes to the domain model affecting how the frontend handles program stages and skill levels.

---

## 1. ProgramStage — New Model & Endpoints

Stages are no longer a static enum. They are now **custom, per-program named stages** stored in the `ProgramStage` table.

### Database Model

```
ProgramStage {
  id        String   // UUID
  programId String   // FK → Program
  name      String   // e.g. "Foundation", "Intermediate", "Advanced"
  createdAt DateTime
  updatedAt DateTime
  // UNIQUE constraint: (programId, name)
}
```

### REST Endpoints

Base path: `/programs/:programId/stages`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/programs/:programId/stages` | Create a stage |
| GET | `/programs/:programId/stages` | List all stages for program |
| GET | `/programs/:programId/stages/:id` | Get single stage |
| PATCH | `/programs/:programId/stages/:id` | Rename stage |
| DELETE | `/programs/:programId/stages/:id` | Delete stage |

### Request / Response Shapes

**POST / PATCH body:**
```json
{ "name": "Foundation" }
```

**Response (single stage):**
```json
{
  "id": "uuid",
  "programId": "uuid",
  "name": "Foundation",
  "createdAt": "2026-04-22T...",
  "updatedAt": "2026-04-22T..."
}
```

### Frontend Implications

- Program detail page must load stages via `GET /programs/:id/stages` before rendering skill forms.
- Skill `stage` field is now a **free-text string** (not an enum dropdown) — or render as a dropdown populated from the program's stage list.
- Stage names must be unique per program — show conflict error on duplicate.

---

## 2. ProgramSkill.stage — String (not enum)

Previously `stage` on `ProgramSkill` was a `Stage` enum. It is now a **plain string** that should match one of the program's `ProgramStage` names.

### What changed

| Field | Before | After |
|-------|--------|-------|
| `ProgramSkill.stage` | `Stage` enum | `String` (free text) |

### Frontend Implications

- Do **not** use a hardcoded enum dropdown for skill stage.
- Fetch `GET /programs/:id/stages` → use returned names as dropdown options.
- Value sent to API is the stage name string (e.g. `"Foundation"`).

---

## 3. Program.level — String (optional)

`Program.level` is a nullable `String?`, not an enum. No `minLevel` / `maxLevel` fields exist.

| Field | Type | Notes |
|-------|------|-------|
| `level` | `String?` | Optional free-text level description (e.g. "Beginner") |

`minLevel` and `maxLevel` **do not exist** — remove any UI referencing them.

---

## 4. Program Response Shape (includes programStages)

`GET /programs` and `GET /programs/:id` now include `programStages` in the response:

```json
{
  "id": "uuid",
  "name": "Advanced Swimming",
  "level": "Beginner",
  "programStages": [
    { "id": "uuid", "name": "Foundation" },
    { "id": "uuid", "name": "Intermediate" }
  ],
  ...
}
```
