import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "./badge";
import { Input } from "./input";
import { Button } from "./button";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

export const TagsInput = ({
  value,
  onChange,
  suggestions = [],
  placeholder = "أضف عنصر...",
  className = ""
}: TagsInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      !value.includes(suggestion) &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Tags Display */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-background">
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="pl-2 pr-1 py-1 flex items-center gap-1"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-destructive/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Input */}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 h-auto"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="border rounded-md bg-popover p-2 shadow-lg max-h-[200px] overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {filteredSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="h-7 text-xs"
              >
                + {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Available Suggestions (Always visible) */}
      {suggestions.length > 0 && !showSuggestions && (
        <div className="flex flex-wrap gap-2 pt-2">
          {suggestions
            .filter((s) => !value.includes(s))
            .slice(0, 10)
            .map((suggestion, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="h-7 text-xs"
              >
                + {suggestion}
              </Button>
            ))}
        </div>
      )}
    </div>
  );
};
