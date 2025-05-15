import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export interface Marker {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
}

const loadMarkers = (): Marker[] => {
  const saved = localStorage.getItem('map-markers');
  return saved ? JSON.parse(saved) : [];
};

const initialState: Marker[] = loadMarkers();

export const markersSlice = createSlice({
  name: 'markers',
  initialState,
  reducers: {
    addMarker: (state, action: PayloadAction<Omit<Marker, 'id'>>) => {
      const newMarker = { ...action.payload, id: uuidv4() };
      state.push(newMarker);
      localStorage.setItem('map-markers', JSON.stringify(state));
    },
    removeMarker: (state, action: PayloadAction<string>) => {
      const newState = state.filter(marker => marker.id !== action.payload);
      localStorage.setItem('map-markers', JSON.stringify(newState));
      return newState;
    },
    updateMarker: (state, action: PayloadAction<Marker>) => {
      const index = state.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
        localStorage.setItem('map-markers', JSON.stringify(state));
      }
    },
  },
});

// Экспортируем actions отдельно
export const { addMarker, removeMarker, updateMarker } = markersSlice.actions;
export default markersSlice.reducer;