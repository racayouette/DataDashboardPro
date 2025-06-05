# Angular 19 Job Management Dashboard

## Project Overview
Complete Angular 19 conversion of the React job management dashboard with the same functionality and design.

## Technology Stack
- **Frontend**: Angular 19 with TypeScript
- **Backend**: Express.js (unchanged)
- **Database**: Microsoft SQL Server
- **Styling**: Tailwind CSS + Angular Material
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router

## Setup Instructions

1. **Create new Angular project:**
```bash
npm install -g @angular/cli@19
ng new job-management-angular --routing --style=scss --skip-git
cd job-management-angular
```

2. **Install dependencies:**
```bash
npm install @angular/material @angular/cdk @angular/animations
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. **Copy the backend server folder** from the existing project to maintain API compatibility

4. **Configure Tailwind CSS** in `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

5. **Add to styles.scss:**
```scss
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Angular Architecture

### Components Structure
```
src/app/
├── components/
│   ├── sidebar/
│   ├── header/
│   ├── data-grid/
│   ├── summary-cards/
│   └── database-health-monitor/
├── pages/
│   ├── dashboard/
│   ├── editing/
│   ├── users/
│   ├── jobs-family/
│   └── notifications/
├── services/
│   ├── api.service.ts
│   ├── websocket.service.ts
│   └── notification.service.ts
├── models/
│   └── interfaces.ts
└── shared/
    └── constants.ts
```

### Key Features Implemented
- Dashboard with summary cards and data grids
- Job description editing with track changes
- Real-time WebSocket connection
- Notification system with bell icon
- User management
- Database health monitoring
- Responsive design with Tailwind CSS

### API Integration
The Angular frontend connects to the same Express.js backend APIs:
- `/api/dashboard/summary`
- `/api/transactions`
- `/api/job-families`
- `/api/reviewers`
- `/api/notifications`

### WebSocket Connection
```typescript
// WebSocket service for real-time updates
@Injectable()
export class WebSocketService {
  private socket: WebSocket;
  
  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
  }
}
```

## Development Commands
- `ng serve` - Start development server
- `ng build` - Build for production
- `ng test` - Run unit tests
- `ng e2e` - Run end-to-end tests

## Migration Benefits
- Modern Angular 19 features including standalone components
- Better TypeScript integration
- Improved performance with OnPush change detection
- Angular Material UI components
- Built-in form validation with Reactive Forms
- Better testing infrastructure with Jasmine/Karma