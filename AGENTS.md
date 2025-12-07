# AI Agent Development Guidelines - Toyzinger PIM

**READ THIS FIRST**: This file contains all mandatory conventions and guidelines for AI agents working on this project.

---

## 🎯 Quick Start - Critical Rules

1. **Colors**: Use ONLY SCSS variables from `src/styles/_variables.scss` - NEVER hardcoded colors
2. **Media Queries**: Use ONLY mixins from `src/styles/_breakpoints.scss` - NEVER raw media queries
3. **Buttons**: Use ONLY styles from `src/styles/_buttons.scss` - NEVER create custom button styles
4. **Signals**: ALWAYS prioritize signals over traditional observables/subjects in component logic
5. **Firebase**: Apply conditional spread for optional fields (Firestore doesn't accept `undefined`)
6. **Components**: Follow BEM naming, use existing form components, organize imports properly
7. **Package Management**: Always use `--legacy-peer-deps --registry https://registry.npmjs.org/`

---

## 📦 Package Management

**CRITICAL**: Always use both flags when installing packages:
```bash
npm install <package> --legacy-peer-deps --registry https://registry.npmjs.org/
```

---

## 🏗️ Project Structure

```
/
├── src/
│   ├── api/              # Backend API routes (Express)
│   ├── app/              # Angular application
│   │   ├── components/   # Reusable components
│   │   ├── features/     # Feature modules
│   │   │   └── {feature}/
│   │   │       ├── {feature}.service.ts    # State management
│   │   │       ├── {feature}.firebase.ts   # Firebase operations
│   │   │       ├── {feature}.api.ts        # HTTP calls (if applicable)
│   │   │       └── {feature}.model.ts      # Interfaces and types
│   │   └── pages/        # Page components
│   ├── styles/           # Global SCSS variables and styles
│   └── server.ts         # SSR server entry point
├── uploads/              # User-uploaded images (gitignored)
│   └── images/
├── public/               # Static assets
└── dist/                 # Production build output
```

---

## 🎨 Styles and Design

### Color Variables (CRITICAL)

**Always import and use SCSS variables from `src/styles/_variables.scss`**

### 🎨 SCSS Variables

**ALWAYS use SCSS variables from `src/styles/_variables.scss`**

```scss
// ✅ CORRECT
background-color: $color-bg-dark;
color: $color-primary;
padding: $spacing-md;

// ❌ WRONG
background-color: #1a1a1a;
color: #007bff;
padding: 16px;
```

**Common variables:**
- Colors: `$color-primary`, `$color-bg-dark`, `$color-text-light`, `$gray-*`

### 🎨 SCSS Color Functions

**Use modern Dart Sass color functions, not deprecated ones**

```scss
// ✅ CORRECT - Modern color.adjust()
@use 'sass:color';

.element {
  background: color.adjust($color-primary, $alpha: -0.9); // 10% opacity
  border-color: color.adjust($color-primary, $lightness: 10%);
}

// ❌ WRONG - Deprecated functions
.element {
  background: transparentize($color-primary, 0.9);
  border-color: lighten($color-primary, 10%);
}
```

**Common color adjustments:**
- Transparency: `color.adjust($color, $alpha: -0.9)` (10% opacity)
- Lightness: `color.adjust($color, $lightness: 10%)`
- Darkness: `color.adjust($color, $lightness: -10%)`

#### Usage Rules:
1. ✅ **ALWAYS** use `@use` not `@import`: `@use 'path/to/styles/variables' as *;`
2. ✅ **NEVER** use hardcoded colors like `#DC8F02` directly
3. ✅ **PREFER** SCSS variables over CSS custom properties (`var(--color-*)`)
4. ✅ Use modern color functions: `color.adjust()`, `color.scale()`, not deprecated `lighten()`, `darken()`, `transparentize()`

> [!IMPORTANT]
> Use `@use` instead of `@import` - `@import` is deprecated and will be removed in Dart Sass 3.0.0

#### Examples:
```scss
// ✅ CORRECT - Using @use
@use '../../../styles/variables' as *;

.button {
  background: $color-primary;
  color: $color-text-light;
  &:hover {
    background: darken($color-primary, 10%);
  }
}

// ❌ WRONG - Using deprecated @import
@import '../../../styles/variables';

// ❌ WRONG - Hardcoded color
.button {
  background: #DC8F02;
}

// ❌ WRONG - CSS custom property
.button {
  background: var(--color-primary);
}
```

### Naming Conventions

#### Component Files
- **Class names**: camelCase (`ImgList`, `FormInput`)
- **File names**: kebab-case matching class name (`img-list.ts`, `form-input.ts`)

#### Component Selectors
- **Main components**: `app-` prefix (`app-img-list`)
- **Sub-components as HTML elements**: attribute selectors (`tr[app-img-list-item]`)

#### SCSS Classes
- **Use BEM** (Block Element Modifier)
- **kebab-case**
```scss
.img-list {
  &__item { }
  &__checkbox { }
  &--disabled { }
}
```

### Style Organization
1. **Simple components**: Own SCSS file
2. **Components with sub-components**:
   - Parent has main SCSS file
   - Children reference parent's SCSS: `styleUrl: '../parent.scss'`

### Media Queries (CRITICAL)

**ALWAYS use breakpoint mixins from `src/styles/_breakpoints.scss`**

#### Rules:
1. ✅ **ALWAYS** import breakpoints: `@use 'breakpoints' as *;`
2. ✅ **NEVER** write raw media queries like `@media (min-width: 768px)`
3. ✅ Use mobile-first approach (base styles → tablet → desktop)

### Buttons (CRITICAL)

**ALWAYS use button styles from `src/styles/_buttons.scss`**

#### Available Button Classes:
- `.btn` - Base button styles
- `.btn--primary` - Primary action button
- `.btn--secondary` - Secondary action button
- `.btn--danger` - Destructive action button

#### Usage:
```html
<!-- ✅ CORRECT -->
<button class="btn btn--primary">Save</button>
<button class="btn btn--danger">Delete</button>

<!-- ❌ WRONG - Don't create custom button styles -->
<button style="background: blue; color: white;">Save</button>
```

#### Rules:
1. ✅ **ALWAYS** use existing button classes from `_buttons.scss`
2. ✅ **NEVER** create custom button styles in component SCSS
3. ✅ Import in component if needed: `@use 'buttons' as *;`

---

## 🏛️ Architecture Patterns

### File Naming by Type

| Type | Pattern | Class Name | Example |
|------|---------|------------|---------|
| State Management | `{feature}.service.ts` | `{Feature}Service` | `images.service.ts` → `ImagesService` |
| Firebase Operations | `{feature}.firebase.ts` | `{Feature}Firebase` | `images.firebase.ts` → `ImagesFirebase` |
| HTTP Calls | `{feature}.api.ts` | `{Feature}Api` | `images.api.ts` → `ImagesApi` |
| Models | `{feature}.model.ts` | Exported interfaces | `images.model.ts` |

### Import Organization

Always group imports in this order:
1. Angular core
2. Feature services
3. Models/interfaces
4. Sub-components
5. Shared components

```typescript
// ✅ CORRECT ORDER
import { Component, inject, effect } from '@angular/core';
import { ImagesService } from '../../features/productimages/productimages.service';
import { ProductImage } from '../../features/productimages/productimages.model';
import { ImgListItem } from './img-list-item/img-list-item';
import { FormInput } from '../form/form-input/form-input';
```

---

## 🔥 Firebase Guidelines

### Handling Optional Values (CRITICAL)

Firestore does NOT accept `undefined` values. Always use conditional spread:

```typescript
// ✅ CORRECT
const data = {
  requiredField: value,
  ...(optionalField && { optionalField }),
  ...(anotherOptional && { anotherOptional }),
};

// ❌ WRONG - Will error if undefined
const data = {
  requiredField: value,
  optionalField: optionalField,
};
```

### Queries
- For documents without a specific field: fetch all and filter on client
- Firestore doesn't support: `where('field', '==', null)` for non-existent fields

### Configuration
- Storage bucket: `toyzinger-pim.firebasestorage.app`
- Uploads directory: `uploads/images/` (not in git)

---

## 🎯 Forms

### Use Existing Form Components

**ALWAYS use these instead of native HTML inputs:**
- `FormInput` - text fields
- `FormCheckbox` - checkboxes
- `FormSelect` - selects

#### Two-way Binding:
```html
<!-- ✅ CORRECT -->
<app-form-input [(value)]="mySignal" />
<app-form-checkbox [(checked)]="isChecked" />

<!-- ❌ WRONG -->
<input [value]="mySignal()" (input)="mySignal.set($event.target.value)" />
```

---

## 📦 State Management (CRITICAL)

### Angular Signals (PRIORITY)

**CRITICAL**: Always prioritize signals over RxJS observables/subjects in component logic

#### When to Use Signals:
- ✅ Component local state
- ✅ Service state management
- ✅ Computed values
- ✅ Reactive UI updates
- ✅ Simple async operations

#### When Observables are OK:
- HTTP requests (keep using HttpClient)
- Complex stream transformations (multiple operators)
- Event streams from external sources

#### Signal Pattern:
```typescript
class MyService {
  // Private signals with _ prefix
  private _items = signal<Item[]>([]);
  private _loading = signal(false);

  // Public readonly signals
  items = this._items.asReadonly();
  loading = this._loading.asReadonly();

  // Computed values
  itemCount = computed(() => this._items().length);
}
```

```typescript
// ✅ CORRECT - Using signals
class MyComponent {
  isVisible = signal(false);
  count = signal(0);

  toggle() {
    this.isVisible.update(v => !v);
  }
}

// ❌ WRONG - Using Subject for simple state
class MyComponent {
  private isVisible$ = new BehaviorSubject(false);

  toggle() {
    this.isVisible$.next(!this.isVisible$.value);
  }
}
```

### Effects
Place in constructor to react to signal changes:
```typescript
constructor() {
  effect(() => {
    const value = this.someSignal();
    // React to changes
  });
}
```

---

## 🧪 Validation & Security

### Client-side
- Validate file types before upload
- Validate input formats
- Show specific errors per field/item

### Server-side
- Validate and sanitize filenames
- Prevent path traversal attacks
- Validate file sizes
- Handle errors gracefully

---

## 📝 Documentation

### JSDoc for Public Methods
```typescript
/**
 * Loads images for a specific folder
 * @param folderId - The ID of the folder to load images from
 * @returns Promise that resolves when images are loaded
 */
async loadImagesByFolder(folderId: string): Promise<void> {
  // ...
}
```

### Code Comments
- Explain the "why", not the "what"
- Mark design decisions
- Use `// TODO:` or `// FIXME:` for workarounds

---

## ⚡ Performance

### Always Use Track in Loops
```html
@for (item of items(); track item.id) {
  <!-- content -->
}
```

### Lazy Loading
- Lazy-load page components when possible
- Avoid importing large modules unnecessarily

### Build Considerations
- Bundle size limit: 2MB (in `angular.json`)
- Production build: `dist/toyzinger-pim/`

---

## 🛠️ Development Workflow

### Commands
```bash
# Dev server (Angular)
ng serve                              # → http://localhost:4200

# SSR server
npm run serve:ssr:toyzinger-pim      # → http://localhost:4000

# Build
npm run build                         # → dist/
```

### Code Standards

#### TypeScript
- Use strict mode
- Prefer `const` over `let`
- Always use type annotations
- Follow Angular style guide

#### Angular
- Use standalone components
- Use signals for reactive state
- Follow Angular style guide

#### HTML Templates
- **Multi-line attributes**: Elements with multiple attributes must use multi-line format
  - **`class` attribute first**: Always place `class` as the first attribute, on the same line as the opening tag
  - **All other attributes**: One attribute per line, indented below the opening tag
  - **Single `class` only**: Elements with only a `class` attribute can stay on one line

```html
<!-- ✅ CORRECT - class on same line, other attributes on separate lines -->
<div class="folders-menu-item__folder"
  [class.folders-menu-item__folder--selected]="isSelected()"
  [style.padding-left.rem]="level() * 1"
  (click)="onSelectFolder($event)">
</div>

<button class="btn-danger"
  (click)="deleteImage()"
  title="Delete image">
  <span class="material-icons-outlined">delete</span>
</button>

<!-- ✅ CORRECT - Single class attribute on same line -->
<div class="header">
  <h1>Title</h1>
</div>

<!-- ✅ CORRECT - No class, first attribute on same line -->
<app-form-input
  [(value)]="mySignal"
  placeholder="Enter text"
/>

<!-- ❌ WRONG - class not first -->
<div [style.padding-left.rem]="level() * 1"
  class="folders-menu-item__folder">
</div>

<!-- ❌ WRONG - Multiple attributes on same line -->
<button class="btn-danger" (click)="deleteImage()" title="Delete">
  Delete
</button>
```

#### Styling
- Use SCSS (not CSS)
- Import variables from `src/styles/_variables.scss`
- Use BEM naming convention

---

## 🔌 API Development

- Routes go in `src/api/`
- Mount routes in `src/server.ts`
- Use Express Router pattern
- Always validate request data
- Handle errors gracefully

---

## 📋 Git Rules

**NEVER commit:**
- `node_modules/`
- `uploads/` folder
- Environment secrets
- `.env` files

---

## ✅ Component Creation Checklist

Before submitting any component:

- [ ] Uses SCSS variables from `_variables.scss`
- [ ] Uses breakpoint mixins from `_breakpoints.scss` (no raw media queries)
- [ ] Uses button styles from `_buttons.scss` (no custom button styles)
- [ ] Imports variables: `@use 'path/to/styles/variables' as *;`
- [ ] Follows naming conventions (kebab-case files, camelCase classes)
- [ ] Uses BEM for CSS classes
- [ ] Uses existing form components (not native HTML inputs)
- [ ] Applies conditional spread for Firebase optional fields
- [ ] Prioritizes signals over observables for component state
- [ ] Uses signals for reactive state
- [ ] Adds `track` to all loops
- [ ] Orders imports correctly
- [ ] Documents public methods with JSDoc
- [ ] Validates inputs on both client and server
- [ ] Handles errors gracefully

---

## 🔗 Quick Reference Links

- **SCSS Variables**: `src/styles/_variables.scss`
- **Breakpoint Mixins**: `src/styles/_breakpoints.scss`
- **Button Styles**: `src/styles/_buttons.scss`
- **Form Components**: `src/app/components/form/`
- **Project Structure**: See above
- **API Routes**: `src/api/`

---

**Last Updated**: 2025-11-24
**Version**: 1.0
