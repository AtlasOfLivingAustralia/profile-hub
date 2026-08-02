import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

export const SearchOptions = {
  scientificName: "Scientific Name",
  commonName: "Common Name",
  containingText: "Containing Text",
} as const;

export type SearchOption = (typeof SearchOptions)[keyof typeof SearchOptions];

const SEARCH_OPTION_VALUES = Object.values(SearchOptions);

const SEARCH_PLACEHOLDERS: Record<SearchOption, string> = {
  [SearchOptions.scientificName]: "e.g. Eucalyptus",
  [SearchOptions.commonName]: "e.g. Blue Gum",
  [SearchOptions.containingText]: "Search profiles…",
};

function isSearchOption(value: string): value is SearchOption {
  return SEARCH_OPTION_VALUES.includes(value as SearchOption);
}

export function Search() {
  const [searchOption, setSearchOption] = useState<SearchOption>(
    SearchOptions.scientificName,
  );

  return (
    <Form.Group className="mb-0">
      <InputGroup>
        <DropdownButton
          variant="secondary"
          title={searchOption}
          id="search-option-dropdown"
          onSelect={(eventKey) => {
            if (eventKey && isSearchOption(eventKey)) {
              setSearchOption(eventKey);
            }
          }}
        >
          {SEARCH_OPTION_VALUES.map((option) => (
            <Dropdown.Item
              key={option}
              eventKey={option}
              active={searchOption === option}
            >
              {option}
            </Dropdown.Item>
          ))}
        </DropdownButton>

        <Form.Control
          aria-label="Search profiles"
          placeholder={SEARCH_PLACEHOLDERS[searchOption]}
        />

        <Button variant="primary" type="button" aria-label="Search">
          <FontAwesomeIcon icon={faSearch} />
        </Button>
      </InputGroup>
    </Form.Group>
  );
}
