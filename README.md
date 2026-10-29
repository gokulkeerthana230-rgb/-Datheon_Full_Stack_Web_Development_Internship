# TaskPulse &mdash; Dynamic Task Manager & Productivity Tracker

A sleek, responsive, and modern Dynamic Task Manager & Productivity Tracker web application built with vanilla HTML, CSS, and ES6+ JavaScript with zero external server dependencies.

![TaskPulse Preview](https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80)

## Features

- **Full CRUD Operations**: Create, read, update/edit via modal dialog, and delete tasks with a 5-second undo toast buffer.
- **Dynamic Productivity Tracker**: Real-time completion rate with an animated SVG radial progress gauge, task count statistics, and overdue alerts.
- **Categorization**: Color-coded badges for `Work`, `Personal`, and `Study`.
- **Priority Levels**: Flag tasks with `High`, `Medium`, and `Low` priorities.
- **Smart Due Date Picker**: Due date selector with quick preset chips (*Today*, *Tomorrow*, *This Weekend*, *Next Monday*).
- **Filtering & Search**: Status filters (*All*, *Active*, *Completed*), category dropdown filter, and live title search bar.
- **Sorting Options**: Sort by earliest/latest due date, priority, recently added, or alphabetically.
- **Smooth Completion Transitions**: Custom animated circular checkmark with strikethrough animation.
- **Persistent State**: State management using `tasks = []` with `saveToLocalStorage()` and `loadFromLocalStorage()`.
- **Dark & Light Mode**: Seamless theme switching with persistent local storage.

## Project Structure

```text
├── index.html        # Main HTML5 application structure & semantic layout
├── style.css         # Modern glassmorphism CSS design system & micro-animations
├── app.js            # ES6+ JavaScript business logic & local storage sync
└── README.md         # Project documentation
```

## Getting Started

1. Clone or download the repository.
2. Open `index.html` directly in any modern browser. No build steps, Node packages, or server installation required!

## License

MIT License.
