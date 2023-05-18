import React from 'react';
import './style.less';
import { ReactComponent as SearchIcon } from '@/ui/assets/jwallet/search.svg';
import { ReactComponent as CloseModalIcon } from '@/ui/assets/jwallet/close-modal.svg';

const SearchField: React.FC<{
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}> = ({ value, placeholder, onChange }) => {
  return (
    <div className="search-container">
      <div className="icon">
        <SearchIcon />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="ml-2 hover:cursor-pointer">
        <CloseModalIcon onClick={() => onChange('')} />
      </div>
    </div>
  );
};

export default SearchField;
