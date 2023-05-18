import useVisible from '@/hooks/forms/useVisible';
import { ReactComponent as ArrowDown } from '@/ui/assets/jwallet/arrow-down.svg';
import clsx from 'clsx';
import React, { ReactNode } from 'react';
import SearchField from '../SearchField';
import './style.less';

export interface IDropdownItem<T = any> {
  label: ReactNode;
  value: T;
  id: string | number;
}

interface IProps {
  options?: IDropdownItem[];
  selected?: IDropdownItem;
  placeHolder?: string;
  onChange?: (item: IDropdownItem) => any;
  styles?: Record<string, string | number>;
  defaultLabel?: string;
  isValid?: boolean;
  allowSearch?: boolean;
  searchText?: string;
  onSearchChange?: (search) => any;
  scrollOnToggle?: boolean;
}

const Dropdown: React.FC<IProps> = ({
  options = [],
  selected,
  placeHolder,
  onChange,
  styles,
  defaultLabel,
  isValid,
  allowSearch,
  searchText,
  onSearchChange,
  scrollOnToggle,
}) => {
  const { isVisible, setIsVisible, ref } = useVisible(false);

  const handleChange = (item: IDropdownItem) => {
    if (onChange) {
      onChange(item);
    }
    setIsVisible(false);
  };

  const getLabel = () => {
    if (!selected) {
      return defaultLabel || placeHolder || '';
    }
    return selected.label;
  };

  const onToggleVisible = () => {
    setIsVisible((old) => {
      const newVisible = !old;

      if (!newVisible || !ref.current || !scrollOnToggle) {
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
      }, 350);
      return newVisible;
    });
  };

  const handleSearchChange = (search: string) => {
    onSearchChange?.(search);
  };

  return (
    <div className="jwallet-dropdown" style={styles} ref={ref}>
      <div
        className={clsx(
          'jwallet-dropdown__main',
          typeof isValid !== 'undefined' &&
            isValid != null &&
            !isValid &&
            'jwallet-dropdown__main__invalid'
        )}
        onClick={onToggleVisible}
      >
        <span className="jwallet-dropdown__main-label">{getLabel()}</span>
        <span className="jwallet-dropdown__main-icon">
          <ArrowDown />
        </span>
      </div>
      {isVisible && (
        <div className="jwallet-dropdown__menus">
          {allowSearch && (
            <div className="px-5 py-2">
              <SearchField
                value={searchText || ''}
                placeholder="Search network"
                onChange={handleSearchChange}
              />
            </div>
          )}
          <ul className="overflow-auto thin-scrollbar max-h-72">
            {options.map((x) => (
              <li
                key={x.id}
                className="jwallet-dropdown__menus-item hover-overlay"
                onClick={() => handleChange(x)}
              >
                <span>{x.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
