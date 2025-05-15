import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Marker } from '../../store/slices/markersSlice';

interface EditMarkerModalProps {
  visible: boolean;
  onCancel: () => void;
  marker: Marker | null;
  onSave: (marker: Marker) => void;
}

const EditMarkerModal: React.FC<EditMarkerModalProps> = ({
  visible,
  onCancel,
  marker,
  onSave,
}) => {
  const [form] = Form.useForm();

  // Обновляем форму при изменении маркера
  useEffect(() => {
    form.resetFields();
    if (marker) {
      form.setFieldsValue(marker);
    }
  }, [marker, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (marker) {
        onSave({ ...marker, ...values });
        onCancel();
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={
        <>
          <EditOutlined style={{ marginRight: 8 }} />
          Редактировать маркер
        </>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Сохранить изменения
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Название маркера"
          rules={[{ required: true, message: 'Пожалуйста, введите название' }]}
        >
          <Input placeholder="Введите название" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Описание"
          rules={[{ max: 200, message: 'Описание не должно превышать 200 символов' }]}
        >
          <Input.TextArea rows={4} placeholder="Введите описание" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditMarkerModal;