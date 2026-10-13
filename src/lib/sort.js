const collator = new Intl.Collator('cs', { sensitivity: 'base' });

// Abecední řazení s českou kolací (č za c, ch za h, diakritika se řadí správně).
export const compareCs = (a, b) => collator.compare(a ?? '', b ?? '');

export const sortByName = (items) => [...items].sort((a, b) => compareCs(a.name, b.name));
