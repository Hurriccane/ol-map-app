import { Modal, Form, Input } from 'antd';
import { useDispatch } from 'react-redux';
import { addMarker } from '../../store/slices/markersSlice';

interface AddMarkerModalProps {
  visible: boolean;
  onCancel: () => void;
  coordinates: [number, number];
}

const AddMarkerModal = ({ visible, onCancel, coordinates }: AddMarkerModalProps) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const handleSubmit = () => {
    form.validateFields().then(values => {
      dispatch(addMarker({
        ...values,
        lat: coordinates[1],
        lng: coordinates[0]
      }));
      form.resetFields();
      onCancel();
    });
  };

  return (
    <Modal 
      title="Добавить маркер" 
      visible={visible} 
      onCancel={onCancel} 
      onOk={handleSubmit}
      okText="Добавить"
      cancelText="Отмена"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Название" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Описание">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddMarkerModal;