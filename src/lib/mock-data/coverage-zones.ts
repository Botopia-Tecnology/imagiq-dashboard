import type { City, CoverageZone } from "@/types/coverage-zones"

export const cities: City[] = [
  {
    id: "bogota",
    name: "Bogotá",
    coordinates: [4.7110, -74.0721],
    zoom: 11,
  },
  {
    id: "medellin",
    name: "Medellín",
    coordinates: [6.2442, -75.5812],
    zoom: 12,
  },
  {
    id: "cali",
    name: "Cali",
    coordinates: [3.4516, -76.5320],
    zoom: 12,
  },
  {
    id: "barranquilla",
    name: "Barranquilla",
    coordinates: [10.9685, -74.7813],
    zoom: 12,
  },
  {
    id: "cartagena",
    name: "Cartagena",
    coordinates: [10.3910, -75.4794],
    zoom: 12,
  },
]

export const coverageZones: CoverageZone[] = [
  {
    id: "zone-1",
    cityId: "bogota",
    name: "Zona Norte",
    type: "polygon",
    coordinates: [
      [4.7310, -74.0921],
      [4.7510, -74.0621],
      [4.7410, -74.0421],
      [4.7210, -74.0621],
    ],
    color: "#3b82f6",
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
    isActive: true,
  },
  {
    id: "zone-2",
    cityId: "bogota",
    name: "Zona Centro",
    type: "circle",
    coordinates: [4.7110, -74.0721],
    radius: 3000,
    color: "#10b981",
    createdAt: new Date("2025-01-16"),
    updatedAt: new Date("2025-01-16"),
    isActive: true,
  },
  {
    id: "zone-3",
    cityId: "medellin",
    name: "El Poblado",
    type: "polygon",
    coordinates: [
      [6.2082, -75.5698],
      [6.2182, -75.5598],
      [6.2082, -75.5498],
      [6.1982, -75.5598],
    ],
    color: "#f59e0b",
    createdAt: new Date("2025-01-17"),
    updatedAt: new Date("2025-01-17"),
    isActive: true,
  },
]
