import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { useIntl } from "react-intl";

export const SearchOptions = {
  scientificName: "scientificName",
  commonName: "commonName",
  containingText: "containingText",
} as const;

export type SearchOption = (typeof SearchOptions)[keyof typeof SearchOptions];

const SEARCH_OPTION_VALUES = Object.values(SearchOptions);

const SEARCH_OPTION_MESSAGE_IDS: Record<SearchOption, string> = {
  [SearchOptions.scientificName]: "search.option.scientificName",
  [SearchOptions.commonName]: "search.option.commonName",
  [SearchOptions.containingText]: "search.option.containingText",
};

const SEARCH_PLACEHOLDER_MESSAGE_IDS: Record<SearchOption, string> = {
  [SearchOptions.scientificName]: "search.placeholder.scientificName",
  [SearchOptions.commonName]: "search.placeholder.commonName",
  [SearchOptions.containingText]: "search.placeholder.containingText",
};

function isSearchOption(value: string): value is SearchOption {
  return SEARCH_OPTION_VALUES.includes(value as SearchOption);
}

export function Search() {
  const intl = useIntl();
  const [searchOption, setSearchOption] = useState<SearchOption>(
    SearchOptions.scientificName,
  );

  return (
    <Form.Group className="mb-0">
      <InputGroup>
        <DropdownButton
          variant="secondary"
          title={intl.formatMessage({
            id: SEARCH_OPTION_MESSAGE_IDS[searchOption],
          })}
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
              {intl.formatMessage({ id: SEARCH_OPTION_MESSAGE_IDS[option] })}
            </Dropdown.Item>
          ))}
        </DropdownButton>

        <Form.Control
          aria-label={intl.formatMessage({ id: "search.input.ariaLabel" })}
          placeholder={intl.formatMessage({
            id: SEARCH_PLACEHOLDER_MESSAGE_IDS[searchOption],
          })}
        />

        <Button
          variant="primary"
          type="button"
          aria-label={intl.formatMessage({ id: "search.button.ariaLabel" })}
        >
          <FontAwesomeIcon icon={faSearch} />
        </Button>
      </InputGroup>
    </Form.Group>
  );
}
