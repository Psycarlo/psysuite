---
paths:
  - 'apps/**/*.{ts,tsx}'
---

# Best Practices

1. Avoid using `useEffect`;
2. We are using react-compiler, so avoid using `useMemo`, `memo`, and `useCallback`;
3. Avoid duplicating code;
4. Avoid using `any`;
5. Avoid Typescript casting (`as Something`);
6. Avoid having business logic in components and page components. Extract these functions to other files;
7. Don't write useless or divider comments. Only write comments if really needed. The code should speak for itself;
8. Try to not duplicate `types` or `interfaces`. Place them in the `types` folder;
9. Code must be readable. No nested conditional logic, nested try/catch, or too much complexity in one function;
10. Try to write tests when you code a new feature;
11. Components should be responsible for receiving data through props and rendering it. Business logic should be kept separate and not placed within components;
12. We are using react-compiler, so only use `useMemo`, `memo`, and `useCallback` when strictly necessary;
