
import React, { useState } from 'react';
import { Product } from '../types';
import { SearchIcon } from './Icons';

interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    manufacturerFilter: string;
    setManufacturerFilter: (manufacturer: string) => void;
    manufacturers: string[];
    allProducts: Product[];
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm, manufacturerFilter, setManufacturerFilter, manufacturers, allProducts }) => {
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [isFocused, setIsFocused] = useState(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.length > 1) {
            const filteredSuggestions = allProducts.filter(p => 
                p.name.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };
    
    const handleSuggestionClick = (productName: string) => {
        setSearchTerm(productName);
        setSuggestions([]);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md sticky top-0 z-30">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-2/3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for drugs or composition..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                     {isFocused && suggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                            {suggestions.map(suggestion => (
                                <li 
                                    key={suggestion.id}
                                    onClick={() => handleSuggestionClick(suggestion.name)}
                                    className="px-4 py-2 cursor-pointer hover:bg-brand-gray border-b last:border-b-0"
                                >
                                    <div className="flex justify-between">
                                        <span className="font-medium">{suggestion.name}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="w-full md:w-1/3">
                    <select
                        value={manufacturerFilter}
                        onChange={(e) => setManufacturerFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                    >
                        {manufacturers.map(m => (
                            <option key={m} value={m}>{m === 'all' ? 'All Manufacturers' : m}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
