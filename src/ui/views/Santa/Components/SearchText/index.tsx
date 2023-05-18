import './style.less';
import { ReactComponent as SearchIcon } from '@/ui/assets/jwallet/search.svg';
import React from 'react';

const SearchText: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="search-container">
      <div className="icon">
        <SearchIcon />
      </div>
      <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchText;
