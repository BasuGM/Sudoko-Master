import type { Difficulty, TechniqueId } from "@/engine";

export interface LessonDemo {
  entries: number[];
  notes: number[];
  highlights: number[];
  caption: string;
}

export interface Lesson {
  id: TechniqueId;
  name: string;
  difficulty: Difficulty;
  summary: string;
  body: string;
  puzzle?: string;
  focusStep?: number;
  demo?: LessonDemo;
}

function mask(digits: number[]): number {
  return digits.reduce((value, digit) => value | (1 << (digit - 1)), 0);
}

function fragment(cells: { index: number; digits: number[] }[], highlights: number[], caption: string): LessonDemo {
  const entries = Array<number>(81).fill(0);
  const notes = Array<number>(81).fill(0);
  for (const cell of cells) notes[cell.index] = mask(cell.digits);
  return { entries, notes, highlights, caption };
}

export const LESSONS: Lesson[] = [
  {
    id: "naked-single",
    name: "Naked single",
    difficulty: "easy",
    summary: "A cell with only one candidate.",
    body: "When a cell can see every digit but one, that last digit is the answer. Check the row, column, and box before you guess.",
    puzzle: "854361729316927458279485613142698375965173284738254961687549132593.12846421836597",
    focusStep: 0,
  },
  {
    id: "hidden-single",
    name: "Hidden single",
    difficulty: "easy",
    summary: "A digit that fits in only one cell of a house.",
    body: "The cell may still list other candidates. If a digit has nowhere else to go in the row, column, or box, it belongs there.",
    puzzle: "8.4.6.7..3.69..4.8279..56...4269.......1......3....9616.75...3.....12....2.......",
    focusStep: 2,
  },
  {
    id: "naked-pair",
    name: "Naked pair",
    difficulty: "medium",
    summary: "Two cells that share the same two candidates.",
    body: "If two cells in a house can only be the same pair of digits, those digits cannot appear anywhere else in that house. Remove them from the other cells.",
    puzzle: "8.4.6.7..3.69..4.8279..56...4269.......1......3....9616.75...3.....12....2.......",
    focusStep: 21,
  },
  {
    id: "hidden-pair",
    name: "Hidden pair",
    difficulty: "medium",
    summary: "Two digits that share the same two cells.",
    body: "When two digits appear in only the same two cells of a house, those cells are reserved for them. Other candidates in the two cells can go.",
    puzzle: "3..7.26..7.94.6........98..897...1.3...9...2..2.1..9.7..8641....6...37.41........",
    focusStep: 8,
  },
  {
    id: "pointing-pair",
    name: "Pointing pair",
    difficulty: "medium",
    summary: "A digit locked to one row or column inside a box.",
    body: "If a digit's only spots in a box lie on a single row or column, it is removed from that line outside the box. A pointing triple works the same way with three cells.",
    puzzle: "8.4.6.7..3.69..4.8279..56...4269.......1......3....9616.75...3.....12....2.......",
    focusStep: 22,
  },
  {
    id: "box-line-reduction",
    name: "Box/line reduction",
    difficulty: "medium",
    summary: "A digit in a line that never leaves one box.",
    body: "This is the reverse of a pointing pair. If every candidate for a digit in a row or column sits inside one box, delete that digit from the rest of the box.",
    puzzle: "4....9..6....3...4......9712..3.1.8.9..5.7....8......5.158...4......3..2..2...5.8",
    focusStep: 22,
  },
  {
    id: "naked-triple",
    name: "Naked triple",
    difficulty: "hard",
    summary: "Three cells that use only three digits between them.",
    body: "The three cells may hold two or three candidates each. Together they claim three digits, so those digits leave every other cell in the house.",
    puzzle: "9....6..42..........3..5..9.....1....6.2...38...4...7..8.....13....43.8..56...7..",
    focusStep: 21,
  },
  {
    id: "hidden-triple",
    name: "Hidden triple",
    difficulty: "hard",
    summary: "Three digits confined to three cells.",
    body: "If three digits appear nowhere else in a house, those three cells must hold them. Candidates outside that trio are removed from the three cells.",
    demo: fragment(
      [
        { index: 0, digits: [1, 2, 4] },
        { index: 1, digits: [1, 3, 5] },
        { index: 2, digits: [2, 3] },
      ],
      [0, 1, 2],
      "In this row, 1, 2, and 3 live only in the first three cells. 4 and 5 can leave those cells.",
    ),
  },
  {
    id: "x-wing",
    name: "X-Wing",
    difficulty: "hard",
    summary: "A digit locked to the same two columns in two rows.",
    body: "When two rows each contain a digit in only the same two columns, one of those cells in each column must hold it. The digit is removed from both columns everywhere else. The same pattern works with columns as the base.",
    puzzle: ".2....6.....81....3.6....7.....3.129.....5..49.7..4..32...8.........734...4.....7",
    focusStep: 33,
  },
  {
    id: "swordfish",
    name: "Swordfish",
    difficulty: "expert",
    summary: "An X-Wing stretched across three lines.",
    body: "Three rows hold a digit in only two or three columns, and those columns number exactly three. The digit is removed from the three columns in every other row. Columns can be the base instead.",
    demo: fragment(
      [
        { index: 0, digits: [8] },
        { index: 1, digits: [8] },
        { index: 10, digits: [8] },
        { index: 11, digits: [8] },
        { index: 18, digits: [8] },
        { index: 20, digits: [8] },
        { index: 27, digits: [8, 1] },
      ],
      [0, 1, 10, 11, 18, 20, 27],
      "Rows 1 to 3 hold 8 in columns 1 to 3 only. The 8 in row 4, column 1 sees all three columns and can be removed.",
    ),
  },
  {
    id: "xy-wing",
    name: "XY-Wing",
    difficulty: "expert",
    summary: "A pivot cell linking two wings that share a digit.",
    body: "The pivot is XY. One wing it sees is XZ, the other is YZ. Whatever the pivot is, one wing must be Z, so any cell that sees both wings cannot be Z.",
    puzzle: ".4.85..2......6.9...7.92.4.8.6...4....19.3..7..34..9...7.6...58......3..6.8......",
    focusStep: 20,
  },
];

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}
