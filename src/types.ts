export interface DictionaryEntry {
  id: string;
  category: string;
  subcategory: string;
  euskara: string[];
  espanol: string[];
  french?: string[];
  english?: string[];
  definition?: string;
}
