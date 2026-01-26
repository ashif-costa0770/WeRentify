"use client";

import {
  AllItemsIcon,
  ApparelIcon,
  CarIcon,
  CleaningIcon,
  ConstructionIcon,
  ElectronicsIcon,
  HolidayIcon,
  HomeIcon,
  LawnIcon,
  MedicalIcon,
  MovingIcon,
  MusicalIcon,
  PartyIcon,
  PhotographyIcon,
  PlumbingIcon,
  PowerIcon,
  RecreationalIcon,
  SeasonalIcon,
  OutdoorIcon,
  ToolsIcon,
  TrailersIcon,
  VacationIcon,
  WinterIcon,
  OtherIcon,
} from "../icons/GridIcons";

const categories = [
  { id: "all", name: "All Items", icon: AllItemsIcon },
  { id: "apparel", name: "Apparel", icon: ApparelIcon },
  { id: "car", name: "Cars/Motorcycle Rentals", icon: CarIcon },
  { id: "cleaning", name: "Cleaning", icon: CleaningIcon },
  {
    id: "construction",
    name: "Construction/Heavy Equipment",
    icon: ConstructionIcon,
  },
  { id: "active", name: "Electronics", icon: ElectronicsIcon },
  { id: "holiday", name: "Holiday Decorations", icon: HolidayIcon },
  { id: "home", name: "Home Improvement", icon: HomeIcon },
  { id: "lawn", name: "Lawn & Garden", icon: LawnIcon },
  { id: "specialty", name: "Medical Equipment", icon: MedicalIcon },
  { id: "moving", name: "Moving & Storage", icon: MovingIcon },
  { id: "musical", name: "Musical Instruments", icon: MusicalIcon },
  { id: "party", name: "Party & Events", icon: PartyIcon },
  { id: "photography", name: "Photography", icon: PhotographyIcon },
  { id: "plumbing", name: "Plumbing", icon: PlumbingIcon },
  { id: "power", name: "Power Tools", icon: PowerIcon },
  {
    id: "recreational",
    name: "RV/Recreational Vehicles",
    icon: RecreationalIcon,
  },
  { id: "seasonal", name: "Seasonal & Emergency", icon: SeasonalIcon },
  { id: "outdoor", name: "Sports & Outdoors", icon: OutdoorIcon },
  { id: "tools", name: "Tools & Accessories", icon: ToolsIcon },
  { id: "trailers", name: "Trailers & Towing", icon: TrailersIcon },
  { id: "vacation", name: "Vacation Rentals", icon: VacationIcon },
  { id: "winter", name: "Winter Equipment", icon: WinterIcon },
  { id: "other", name: "Other", icon: OtherIcon },
];

export default function ItemCategoryGrid({
  selectedCategory,
  onCategorySelect,
}) {
  return (
    <section className="max-w-7xl mx-auto">
      <div className="hidden md:grid grid-cols-12 gap-2">
        {categories.map(({ id, name, icon: Icon }) => {
          const isActive = selectedCategory === id;

          return (
            <button
              key={id}
              onClick={() => onCategorySelect(id)}
              className={`h-23 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all
                ${
                  isActive
                    ? "bg-linear-to-r from-[#5B4FE9] to-[#E95FC8] text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-purple-400"
                }`}
            >
              <span className="text-2xl leading-none">
                <Icon />
              </span>

              <span className="text-[10px] font-bold text-center leading-tight whitespace-pre-line">
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
