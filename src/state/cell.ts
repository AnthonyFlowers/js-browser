export type CellTypes = "code" | "text";

export interface Cell {
  id: string;
  type: CellTypes;
  content: string;
}

export interface Book {
  order: string[];
  data: { [key: string]: Cell };
  title: string;
}
