import React, { useRef, useEffect, useState, useCallback } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import Overlay from 'ol/Overlay';
import { Button } from 'antd';
import { PlusOutlined} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { removeMarker, updateMarker } from '../../store/slices/markersSlice';
import AddMarkerModal from '../AddMarkerModal/AddMarkerModal';
import EditMarkerModal from '../EditMarkerModal/EditMarkerModal';
import { Marker } from '../../store/slices/markersSlice';


const DEFAULT_CENTER = fromLonLat([39.7139, 47.2362]);
const DEFAULT_ZOOM = 12;

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [clickCoords, setClickCoords] = useState<[number, number]>([0, 0]);
  const [editingMarker, setEditingMarker] = useState<Marker | null>(null);
  const markers = useSelector((state: RootState) => state.markers);
  const dispatch = useDispatch();
  const popupState = useRef({
    isHovered: false,
    timeoutId: null as NodeJS.Timeout | null,
  });
  
  const handleDeleteMarker = useCallback((id: string) => {
    dispatch(removeMarker(id));
  }, [dispatch]);

  const handleUpdateMarker = useCallback((marker: Marker) => {
    dispatch(updateMarker(marker));
  }, [dispatch]);

  useEffect(() => {
    if (!mapRef.current || !popupRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: new VectorSource() }),
      ],
      view: new View({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM }),
    });

    const popup = new Overlay({
      element: popupRef.current,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });
    map.addOverlay(popup);

    // Обработчик кликов для добавления маркеров
    map.on('click', (e) => {
      const [lng, lat] = toLonLat(e.coordinate);
      setClickCoords([lng, lat]);
      setModalVisible(true);
    });

    // Обновление маркеров
    const vectorSource = (map.getLayers().item(1) as VectorLayer<VectorSource>).getSource()!;
    vectorSource.clear();

    markers.forEach(marker => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([marker.lng, marker.lat])),
        name: marker.name,
        description: marker.description,
        id: marker.id,
      });

      feature.setStyle(
        new Style({
          image: new Icon({
            src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            scale: 0.05,
          }),
        })
      );
      vectorSource.addFeature(feature);
    });

    const checkHover = (e: MouseEvent) => {
      if (!popupRef.current) return;
      
      const popupRect = popupRef.current.getBoundingClientRect();
      const expandedRect = {
        left: popupRect.left - 20,
        right: popupRect.right + 20,
        top: popupRect.top - 20,
        bottom: popupRect.bottom + 20
      };

      const isHovering = 
        e.clientX >= expandedRect.left &&
        e.clientX <= expandedRect.right &&
        e.clientY >= expandedRect.top &&
        e.clientY <= expandedRect.bottom;

      if (isHovering) {
        if (popupState.current.timeoutId) {
          clearTimeout(popupState.current.timeoutId);
          popupState.current.timeoutId = null;
        }
        popupState.current.isHovered = true;
      } else if (popupState.current.isHovered) {
        popupState.current.isHovered = false;
        popupState.current.timeoutId = setTimeout(() => {
          if (!popupState.current.isHovered) {
            popup.setPosition(undefined);
          }
        }, 300);
      }
    };

    const pointerMoveHandler = (e: any) => {
      const feature = map.forEachFeatureAtPixel(e.pixel, (f) => f);
      if (feature) {
        const geometry = feature.getGeometry() as Point;
        if (geometry?.getType() === 'Point') {
          const coordinates = geometry.getCoordinates();
          popupRef.current!.innerHTML = `
            <div class="popup-content">
              <h3>${feature.get('name')}</h3>
              ${feature.get('description') ? `<p>${feature.get('description')}</p>` : ''}
              <div class="popup-actions">
                <button class="edit-btn" data-id="${feature.get('id')}">
                  <EditOutlined /> Редактировать
                </button>
                <button class="delete-btn" data-id="${feature.get('id')}">
                  <DeleteOutlined /> Удалить
                </button>
              </div>
            </div>
          `;
          popup.setPosition(coordinates);
          map.getTargetElement().style.cursor = 'pointer';
          map.getViewport().addEventListener('mousemove', checkHover);
        }
      } else if (!popupState.current.isHovered) {
        popup.setPosition(undefined);
        map.getTargetElement().style.cursor = '';
      }
    };

    map.on('pointermove', pointerMoveHandler);

    const popupClickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const deleteBtn = target.closest('.delete-btn');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        if (id) {
          handleDeleteMarker(id);
          popup.setPosition(undefined);
        }
      }

      const editBtn = target.closest('.edit-btn');
      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        if (id) {
          const marker = markers.find(m => m.id === id);
          if (marker) {
            setEditingMarker(marker);
            setEditModalVisible(true);
          }
        }
      }
    };
    popupRef.current.addEventListener('click', popupClickHandler);

    return () => {
      map.un('pointermove', pointerMoveHandler);
      popupRef.current?.removeEventListener('click', popupClickHandler);
      map.getViewport().removeEventListener('mousemove', checkHover);
      if (popupState.current.timeoutId) {
        clearTimeout(popupState.current.timeoutId);
      }
      map.setTarget(undefined);
    };
  }, [markers, handleDeleteMarker]);

  return (
    <>
      <div ref={mapRef} className="map-container" />
      <div ref={popupRef} className="ol-popup" />
      <Button
        type="primary"
        shape="circle"
        icon={<PlusOutlined />}
        size="large"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1,
        }}
        onClick={() => setModalVisible(true)}
      />
      <AddMarkerModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        coordinates={clickCoords}
      />
      <EditMarkerModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        marker={editingMarker}
        onSave={handleUpdateMarker}
      />
    </>
  );
};

export default MapComponent;