import { Drawer, DrawerProps } from 'antd';
import clsx from 'clsx';
import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import { SvgIconCross } from 'ui/assets';
const closeIcon = <SvgIconCross className="w-6 fill-white text-gray-content" />;

interface PopupProps extends DrawerProps {
  onCancel?: () => void;
  children?: ReactNode;
}

const Popup = ({
  children,
  closable = false,
  placement = 'bottom',
  className,
  onClose,
  onCancel,
  ...rest
}: PopupProps) => (
  <Drawer
    onClose={onClose || onCancel}
    closable={closable}
    placement={placement}
    className={clsx('custom-popup', className)}
    destroyOnClose
    closeIcon={closeIcon}
    {...rest}
  >
    {children}
  </Drawer>
);

const open = (
  config: PopupProps & {
    content?: ReactNode;
  }
) => {
  const container = document.createDocumentFragment();

  function destroy() {
    ReactDOM.unmountComponentAtNode(container);
  }

  function render({
    visible = true,
    content,
    onClose,
    onCancel,
    ...props
  }: any) {
    setTimeout(() => {
      const handleCancel = () => {
        close?.();
        onClose?.();
        onCancel?.();
      };
      ReactDOM.render(
        <Popup open={false} onClose={handleCancel} {...props}>
          {content}
        </Popup>,
        container
      );
      if (visible) {
        setTimeout(() => {
          ReactDOM.render(
            <Popup open={visible} onClose={handleCancel} {...props}>
              {content}
            </Popup>,
            container
          );
        });
      }
    });
  }

  function close() {
    render({
      visible: false,
      afterVisibleChange: (v) => {
        if (!v) {
          destroy();
        }
      },
    });
  }

  render(config);
  return {
    destroy: close,
  };
};

Popup.open = Popup.info = open;

export default Popup;
