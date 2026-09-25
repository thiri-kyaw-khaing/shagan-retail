export type BranchId = number;

export type Branch = {
  id: BranchId;
  name: string;
};

export const branches: Branch[] = [
  { id: 1, name: "Main Street Branch" },
  { id: 2, name: "North Market Branch" },
];
