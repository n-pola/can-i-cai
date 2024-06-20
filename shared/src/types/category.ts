/** Category in mongodb */
export interface Category {
  id: string; // assigned by db
  name: {
    de: string;
    en: string;
  };
  icon: string;
  types: string[];
}
