import React from 'react';
import { Modal } from 'antd';

/**
 * A wrapper for Ant Design Modal component that uses the latest props
 * instead of deprecated ones.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Controls visibility of the modal
 * @param {Function} props.onCancel - Function called when modal is cancelled
 * @param {ReactNode} props.children - Child components to render inside the modal
 * @param {ReactNode} props.title - Title of the modal
 * @param {ReactNode} props.footer - Footer content of the modal
 * @param {number|string} props.width - Width of the modal
 * @param {boolean} props.centered - Whether to center the modal
 */
const ModalWrapper = ({ 
  visible, 
  onCancel, 
  children, 
  title,
  footer,
  width,
  centered = true,
  ...otherProps 
}) => {
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      title={title}
      footer={footer}
      width={width}
      centered={centered}
      destroyOnHidden={true} // Use this instead of destroyOnClose
      {...otherProps}
    >
      {children}
    </Modal>
  );
};

export default ModalWrapper;
