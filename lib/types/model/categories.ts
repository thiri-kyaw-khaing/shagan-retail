import {
  Grid2X2,
  Utensils,
  CupSoda,
  House,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";

export type CategoryId = number | null;

export type Category = {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
};

export const categories: Category[] = [
  {
    id: null,
    label: "All",
    icon: Grid2X2,
  },
  {
    id: 1,
    label: "Food",
    icon: Utensils,
  },
  {
    id: 2,
    label: "Drink",
    icon: CupSoda,
  },
  {
    id: 3,
    label: "Household",
    icon: House,
  },
  {
    id: 4,
    label: "Combos",
    icon: PackageCheck,
  },
];
