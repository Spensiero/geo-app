 A web application for visualizing drone no-fly zones and geographical regions in the Netherlands, built with React and OpenLayers.

## Features

- Interactive map of the Netherlands
- View different geographical regions and flight zones
- Toggle between different map layers
- Change opacity of map layers
- Legend showing zone types and their meanings
- Built with TypeScript for type safety

## Technologies Used

### Main Technologies
- React 19 - UI components and state management
- TypeScript - Type checking and better development experience
- Vite - Build tool and development server
- OpenLayers - Interactive map visualization
- Proj4 - Coordinate system transformations

### Data Sources
- WFS (Web Feature Service) for dynamic map data
- Dutch coordinate system (EPSG:28992) support

### Styling
- Tailwind CSS - Utility-first CSS framework
- Lucide React - Icons

### Development Tools
- Vitest - Testing framework
- ESLint - Code linting
- Testing Library - Component testing

## Getting Started

### Prerequisites
- Node.js (v16 or newer)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/geo-app.git
   cd geo-app
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

### Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

### Available Scripts

- `dev` - Start development server
- `build` - Build for production
- `test` - Run tests
- `test:watch` - Run tests in watch mode
- `test:coverage` - Generate test coverage report
- `lint` - Lint code

## Project Structure

```
src/
├── components/            # React components
│   ├── header/           # Header component
│   └── mapComponent/     # Map-related components
├── config/               # Configuration files
│   └── wfs.ts            # WFS layer configurations
├── hooks/                # Custom hooks
│   └── UseMapLayers.tsx  # Map layer management logic
├── App.tsx               # Main App component
└── main.tsx              # Application entry point
```

## Map Data

The application displays two main types of geographical data:

1. **Flight Zones**
   - Forbidden areas (red)
   - Limited permission areas (blue)
   - Natura2000 protected areas (green)

2. **Physical Geographical Regions**
   - Dunes
   - Tidal areas
   - Higher sandy grounds
   - Peat areas
   - And more...

## License

MIT
