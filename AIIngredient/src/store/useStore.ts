import {create} from 'zustand';

type ScanItem = {
  id: string;
  text: string;
  date: number;
};

type State = {
  scans: ScanItem[];
  addScan: (text: string) => void;
  clearScans: () => void;
};

export const useStore = create<State>(set => ({
  scans: [],
  addScan: (text: string) =>
    set(state => ({
      scans: [
        {id: Math.random().toString(36).slice(2), text, date: Date.now()},
        ...state.scans,
      ],
    })),
  clearScans: () => set({scans: []}),
}));
