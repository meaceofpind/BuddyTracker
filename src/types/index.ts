import type {
  Pet,
  TrackerList,
  FormOption,
  TrackerEntry,
  TrackerEntryData,
  TrackerEntryImage,
} from "@prisma/client";

export type { Pet, TrackerList, FormOption, TrackerEntry, TrackerEntryData, TrackerEntryImage };

export type TrackerListWithOptions = TrackerList & {
  options: FormOption[];
};

export type TrackerEntryWithData = TrackerEntry & {
  data: TrackerEntryData[];
  images: TrackerEntryImage[];
};

export type PetWithTrackers = Pet & {
  trackers: TrackerListWithOptions[];
};

export type FieldType = "Text" | "Date" | "Decimal" | "Integer" | "Image";
