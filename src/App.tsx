import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store'; // Файл store.ts находится в папке store, не в slices
import Map from './components/Map';
import './styles/global.css';

const App = () => (
  <Provider store={store}>
    <Map />
  </Provider>
);

export default App;