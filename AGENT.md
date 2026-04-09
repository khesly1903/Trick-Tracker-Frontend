# TrickTracker UI Roadmap & Guidelines

## 🎨 Design Principles

- **Framework**: Only **MUI (Material UI) v6+**.
- Also for the data displays use MUI x for example import { DataGrid } from '@mui/x-data-grid';
- **Styling**: Use MUI `sx` prop or `styled` components. **Zero** external `.css` files. **Zero** inline logic for styles.
- **Theme**: Centralized `ThemeContext.tsx` using `createTheme` for Dynamic Light/Dark mode and TrickTracker branding (Navy/Electric Blue/Slate).
- **Styling Rules**: Use `rem` and `em` for all spacing, padding, and font-sizes.
- **Navigation**: Persistent Sidebar with integrated Theme Switch (bottom), and fixed Top Bar for user/portal context.

## 📂 Project Structure

```text
src/
├── api/              # (TS Migrated)
├── components/       # Reusable atoms (Buttons, Inputs, Cards, DataGrids)
├── layouts/          # Root layout and shared layout components
├── pages/            # Page-level views
│   ├── dashboard/    # Primary Overview (Route: /)
│   ├── students/     # Profiles & Search (Route: /students)
│   ├── programs/     # Course & Schedule management (Route: /programs)
│   ├── attendance/   # Lab for rapid logging (Route: /attendance)
│   └── management/   # Settings (Instructors, Locations, Classes)
├── theme/            # Theme, Palette and Overrides
└── hooks/            # UI Helpers (useNotification, useDialog)
```

## 🚀 Page Roadmap (Students Page)

_The core management hub for students._

- **Header**: Dynamic breadcrumbs and "Add Student" primary FAB/Button.
- **Search & Filters**:
  - Real-time search (Name, Surname, ID).
  - Status filter (Active/Inactive Students).
  - Program filter (MUI Autocomplete/Select).
- **Inventory View**:
  - **DataGrid**: Responsive table using MUI `DataGrid`.
  - Columns: Avatar, Full Name, Active Programs, Skill Mastery Avg.
  - Actions: Quick-toggle status, view profile, edit.
- **Profile Detail (Detailed View)**:
  - **MUI Tabs**:
    1. **General**: Personal details, age, linked contacts.
    2. **Skill Progress**: Visual mastery bars for "Trick" progression.
    3. **Attendance**: Calendar or list for past session history.
    4. **Enrollments**: Active programs management.

## 🛠️ Tech Rules for Antigravity

- Always check `src/api/types.ts` for data contracts.
- Use `react-hook-form` for complex validation.
- Implement `Skeleton` loaders for async states.
- Ensure "No Data" states for all tables/grids.
