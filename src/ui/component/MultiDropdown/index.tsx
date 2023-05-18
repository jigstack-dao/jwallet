import useVisible from '@/hooks/forms/useVisible';
import { ReactComponent as ArrowDown } from '@/ui/assets/jwallet/arrow-down.svg';
import React, { ReactNode } from 'react';
import Checkbox from '../CheckboxV2';
import './style.less';

export interface IDropdownItem {
  label: ReactNode;
  value: number | string;
  id: string | number;
}

interface IProps {
  options?: IDropdownItem[];
  selected?: IDropdownItem[];
  placeHolder?: string;
  selectedRender?: ReactNode;
  onChange?: (item: IDropdownItem[]) => void;
  styles?: Record<string, string | number>;
  onToggleOpen?: (open: boolean) => any;
}

const MultiDropdown: React.FC<IProps> = ({
  options = [],
  selected = [],
  selectedRender,
  placeHolder,
  onChange,
  styles,
  onToggleOpen,
}) => {
  const { isVisible, setIsVisible, ref } = useVisible(false);

  const handleChange = (item: IDropdownItem) => {
    if (onChange) {
      const isDuplicated =
        selected.find((x) => x.value == item.value) != undefined;
      const items = isDuplicated
        ? selected.filter((x) => x.value != item.value)
        : [...selected, item];
      onChange(items);
    }
  };

  const getLabel = () => {
    if (selected.length == 0) {
      return placeHolder || '';
    }
    return selected.map((x) => x.label).join(', ');
  };

  const onToggleVisible = () => {
    setIsVisible((old) => {
      const newVisible = !old;

      onToggleOpen?.(newVisible);
      if (!newVisible || !ref.current) {
        return newVisible;
      }
      if (typeof document == 'undefined') {
        return newVisible;
      }
      const extension = document.getElementById('extension');
      if (!extension) {
        return newVisible;
      }
      const offset =
        ref.current.getBoundingClientRect().top + extension.scrollTop;

      setTimeout(() => {
        extension.scrollTo({
          top: offset,
          behavior: 'smooth',
        });
      }, 400);
      return newVisible;
    });
  };

  return (
    <div className="jwallet-dropdown" style={styles} ref={ref}>
      <div className="jwallet-dropdown__main" onClick={onToggleVisible}>
        {selectedRender || (
          <span className="jwallet-dropdown__main-label">{getLabel()}</span>
        )}
        <span className="jwallet-dropdown__main-icon">
          <ArrowDown />
        </span>
      </div>
      {isVisible && (
        <div className="jwallet-dropdown__menus">
          <ul className="overflow-auto thin-scrollbar max-h-72">
            {options.map((x) => (
              <li
                key={x.id}
                className="jwallet-dropdown__menus-item hover-overlay"
                onClick={() => handleChange(x)}
              >
                <Checkbox
                  checked={selected.map((y) => y.value).includes(x.value)}
                >
                  <span className="ml-1">{x.label}</span>
                </Checkbox>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiDropdown;
