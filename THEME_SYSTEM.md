# Dark/Light Theme System

## Overview
The School ERP system now includes a comprehensive dark/light theme system that allows users to switch between themes based on their preference.

## Features

### 🌙 Theme Toggle
- **Location**: Top navigation bar (next to notifications)
- **Login Page**: Top-right corner
- **Visual**: Animated toggle switch with sun/moon icons
- **Persistence**: Theme preference is saved in localStorage

### 🎨 Theme Support
- **Automatic Detection**: Respects system preference on first visit
- **Manual Override**: Users can manually switch themes
- **Persistence**: Theme choice is remembered across sessions
- **Smooth Transitions**: Animated transitions between themes

## Implementation

### Theme Context (`client/src/contexts/ThemeContext.js`)
```javascript
const { isDarkMode, toggleTheme, setTheme, theme } = useTheme();
```

### Theme Toggle Component (`client/src/components/ThemeToggle.js`)
- Reusable toggle component
- Accessible with proper ARIA labels
- Smooth animations

### Dark Mode Styles (`client/src/styles/dark-mode.css`)
- Comprehensive CSS variables for consistent theming
- Support for all UI components
- Custom scrollbar styling for dark mode

## Supported Components

### ✅ Fully Supported
- **Layout**: Sidebar, navigation, top bar
- **Dashboard**: All cards, charts, and content
- **Login Page**: Complete dark mode support
- **Forms**: Input fields, buttons, dropdowns
- **Tables**: Headers, rows, hover states
- **Modals**: Backgrounds, borders, text
- **Alerts**: Success, error, warning, info variants

### 🎯 Theme Classes
- `dark:` prefix for Tailwind CSS dark mode classes
- CSS custom properties for consistent theming
- Automatic class toggling on document root

## Usage

### For Developers
1. **Add Theme Context**: Wrap components with `ThemeProvider`
2. **Use Theme Hook**: Import and use `useTheme()` hook
3. **Apply Dark Classes**: Use `dark:` prefix with Tailwind classes
4. **Test Both Themes**: Ensure components work in both modes

### For Users
1. **Toggle Theme**: Click the theme toggle in the navigation
2. **Automatic Save**: Theme preference is automatically saved
3. **System Sync**: First visit respects system preference
4. **Persistent**: Theme choice persists across browser sessions

## Technical Details

### Theme Detection
```javascript
// Check localStorage first, then system preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  return savedTheme === 'dark';
}
return window.matchMedia('(prefers-color-scheme: dark)').matches;
```

### CSS Variables
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #111827;
  /* ... */
}

.dark {
  --bg-primary: #1f2937;
  --text-primary: #f9fafb;
  /* ... */
}
```

### Document Class Toggle
```javascript
// Automatically adds/removes 'dark' class on document root
if (isDarkMode) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
```

## Browser Support
- **Modern Browsers**: Full support with CSS custom properties
- **Fallback**: Graceful degradation for older browsers
- **System Integration**: Respects `prefers-color-scheme` media query

## Future Enhancements
- [ ] Theme-specific color schemes (blue, green, purple)
- [ ] High contrast mode for accessibility
- [ ] Theme preview before applying
- [ ] Bulk theme updates for all components
- [ ] Theme-specific component variants

## Testing
1. **Manual Testing**: Toggle theme and verify all components
2. **System Preference**: Test with system dark/light mode
3. **Persistence**: Verify theme persists after page refresh
4. **Accessibility**: Ensure proper contrast ratios in both themes
