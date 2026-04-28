'use client';

import { Badge } from './badge';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '../utilities/utils/common.util';
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { API } from '../utilities/api';
import { Command as CommandPrimitive } from 'cmdk';

export interface SearchableMultiSelectOption {
  value: string;
  label: string;
  [key: string]: any;
}

const DEFAULT_OPTIONS: SearchableMultiSelectOption[] = [];
const DEFAULT_VALUE: string[] = [];

export interface SearchableMultiSelectProps {
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (values: string[]) => void;
  onSearchChange?: (search: string) => void;
  options?: SearchableMultiSelectOption[];
  apiUrl?: string;
  apiFunction?: (params: any) => Promise<any[]>;
  searchKey?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  debounceMs?: number;
  minSearchLength?: number;
  maxHeight?: string;
  maxDisplay?: number;
}

const SearchableMultiSelect = ({
  ref,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  value,
  defaultValue,
  onValueChange,
  onSearchChange,
  options = DEFAULT_OPTIONS,
  apiUrl,
  apiFunction,
  searchKey = 'key_search',
  disabled = false,
  loading: externalLoading = false,
  className,
  triggerClassName,
  contentClassName,
  debounceMs = 300,
  minSearchLength = 0,
  maxHeight = '300px',
  maxDisplay = 3,
}: SearchableMultiSelectProps & { ref?: React.RefObject<React.ElementRef<typeof Button> | null> }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  const [apiOptions, setApiOptions] = useState<SearchableMultiSelectOption[]>([]);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? DEFAULT_VALUE);
  const currentValues = value ?? internalValue;

  const isLoading = externalLoading || internalLoading;
  const finalOptions = useMemo(
    () => (apiUrl || apiFunction ? apiOptions : options),
    [apiUrl, apiFunction, apiOptions, options],
  );

  const fetchOptions = useCallback(
    async (searchTerm: string = '') => {
      if (!apiUrl && !apiFunction) return;

      setInternalLoading(true);
      try {
        let data: SearchableMultiSelectOption[] = [];
        if (apiFunction) {
          const params = searchTerm ? { [searchKey]: searchTerm } : {};
          const result = await apiFunction(params);
          data = Array.isArray(result) ? result : (result as any)?.data || [];
        } else if (apiUrl) {
          const params: Record<string, string> = {};
          if (searchTerm) params[searchKey] = searchTerm;
          const response = await API.get<{ data: SearchableMultiSelectOption[] }>(apiUrl, { params });
          data = response.data.data;
        }
        setApiOptions(data);
      } catch {
        setApiOptions([]);
      } finally {
        setInternalLoading(false);
      }
    },
    [apiUrl, apiFunction, searchKey],
  );

  // Debounced search
  useEffect(() => {
    if (!apiUrl && !apiFunction) return;
    if (search.length < minSearchLength) {
      setApiOptions([]);
      return;
    }
    const id = setTimeout(() => fetchOptions(search), debounceMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, fetchOptions, debounceMs, minSearchLength]);

  // Load initial options when first opened
  useEffect(() => {
    if (open && (apiUrl || apiFunction) && !hasInitialLoad && search.length === 0) {
      setHasInitialLoad(true);
      fetchOptions('');
    }
  }, [open, apiUrl, apiFunction, hasInitialLoad, search.length, fetchOptions]);

  const handleSearchChange = useCallback(
    (next: string) => {
      setSearch(next);
      onSearchChange?.(next);
    },
    [onSearchChange],
  );

  const toggleValue = useCallback(
    (val: string) => {
      const next = currentValues.includes(val) ? currentValues.filter((v) => v !== val) : [...currentValues, val];
      if (value !== undefined) {
        onValueChange?.(next);
      } else {
        setInternalValue(next);
        onValueChange?.(next);
      }
    },
    [currentValues, value, onValueChange],
  );

  const removeValue = useCallback(
    (val: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleValue(val);
    },
    [toggleValue],
  );

  const clearAll = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (value !== undefined) {
        onValueChange?.([]);
      } else {
        setInternalValue([]);
        onValueChange?.([]);
      }
    },
    [value, onValueChange],
  );

  const selectedOptions = useMemo(
    () => finalOptions.filter((o) => currentValues.includes(o.value)),
    [finalOptions, currentValues],
  );

  // When options haven't loaded yet (API mode, dropdown closed), build display from stored values
  const displayOptions = useMemo(() => {
    if (selectedOptions.length > 0) return selectedOptions;
    // Fallback: use value strings if labels aren't available yet
    return currentValues.map((v) => ({ value: v, label: v }));
  }, [selectedOptions, currentValues]);

  const hasValues = currentValues.length > 0;
  const visibleBadges = displayOptions.slice(0, maxDisplay);
  const overflowCount = displayOptions.length - maxDisplay;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full min-h-9 h-auto justify-between font-normal',
            !hasValues && 'text-muted-foreground',
            className,
            triggerClassName,
          )}>
          <div className="flex flex-1 flex-wrap gap-1 overflow-hidden">
            {hasValues ? (
              <>
                {visibleBadges.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant="secondary"
                    className="max-w-[160px] truncate pl-2 pr-1 text-xs font-normal">
                    <span className="truncate">{opt.label}</span>
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={(e) => removeValue(opt.value, e)}
                      className="ml-1 shrink-0 rounded-full hover:bg-muted-foreground/20">
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                {overflowCount > 0 && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    +{overflowCount}
                  </Badge>
                )}
              </>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('w-full p-0', contentClassName)}
        style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command shouldFilter={!apiUrl && !apiFunction}>
          <div className="flex items-center border-b px-3">
            <div className="flex flex-1 items-center">
              <Search className="mr-2 size-4 shrink-0 opacity-50" />
              <CommandPrimitive.Input
                placeholder={searchPlaceholder}
                value={search}
                onValueChange={handleSearchChange}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-1">
              {isLoading && <Loader2 className="size-4 shrink-0 animate-spin opacity-50" />}
              {hasValues && !disabled && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-sm p-0.5 text-xs text-muted-foreground hover:text-foreground"
                  tabIndex={-1}>
                  Clear
                </button>
              )}
            </div>
          </div>
          <CommandList style={{ maxHeight }}>
            {isLoading && finalOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
            ) : finalOptions.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {finalOptions.map((option) => {
                  const checked = currentValues.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.value} ${option.label}`}
                      onSelect={() => toggleValue(option.value)}
                      className="cursor-pointer">
                      <div className="flex w-full items-center gap-2">
                        <Checkbox checked={checked} tabIndex={-1} className="pointer-events-none" />
                        <span>{option.label}</span>
                        {checked && <Check className="ml-auto size-4 shrink-0 text-primary" />}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

SearchableMultiSelect.displayName = 'SearchableMultiSelect';

export { SearchableMultiSelect };
