// Language type
export type Language = 'en' | 'es';

// Multilingual string using Language type
export type MultilingualString = Record<Language, string>;

// Multilingual array of strings using Language type
export type MultilingualStringArray = Record<Language, string[]>;
