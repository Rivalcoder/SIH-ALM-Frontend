import rawData from '../../data.json';
import { Plane, Train, ShoppingBag, Stethoscope, Building2, Activity, MapPin, TrendingUp, LucideIcon, Clock, Filter, AlertTriangle, Ship, Store } from "lucide-react";

export interface Timeframe {
    id: string;
    name: string;
    status: string;
    risk?: string;
}

export interface Spot {
    id: string;
    name: string;
    status: string;
    timeframes: Timeframe[];
}

export interface Place {
    id: string;
    name: string;
    status: string;
    type: string;
    spots: Spot[];
}

export interface Sector {
    id: string;
    title: string;
    icon: string;
    image?: string;
    capacity: string;
    utilization: string;
    facilities: string;
    places: Place[];
}

export interface City {
    id: string;
    name: string;
    description: string;
    sectors: Sector[];
}

// Icon Mapping
const iconMap: Record<string, LucideIcon> = {
    "Plane": Plane,
    "Train": Train,
    "ShoppingBag": ShoppingBag,
    "Stethoscope": Stethoscope,
    "Building2": Building2,
    "Activity": Activity,
    "MapPin": MapPin,
    "TrendingUp": TrendingUp,
    "Clock": Clock,
    "Ship": Ship,
    "Store": Store
};

export const getIcon = (iconName: string) => {
    return iconMap[iconName] || Building2;
};

export const citiesData = (rawData.cities || []) as City[];

export const getCity = (id: string) => {
    return citiesData.find(c => c.id === id);
};
