import { create } from "zustand";

interface AcademicYearFilterState {
  selectedAcademicYearId: string | null;
  setSelectedAcademicYearId: (id: string | null) => void;
}

export const useAcademicYearStore = create<AcademicYearFilterState>((set) => ({
  selectedAcademicYearId: null,
  setSelectedAcademicYearId: (id) => set({ selectedAcademicYearId: id }),
}));
