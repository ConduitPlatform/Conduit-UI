import { useEffect, useState } from 'react';
import { accepts } from 'mongodb-language-model';
import parse from 'mongodb-query-parser';

const useParseQuery = (value: string, delay: number) => {
  const [debouncedSearch, setDebouncedSearch] = useState<any>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      if (accepts(value)) {
        setDebouncedSearch(parse.parseFilter(value));
      } else {
        setDebouncedSearch(parse.parseFilter('{}'));
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedSearch;
};

export default useParseQuery;
