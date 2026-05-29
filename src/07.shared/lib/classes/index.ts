import { twMerge } from "tailwind-merge";
import { ClassNameValue } from "tailwind-merge";

const classes = (...args: ClassNameValue[]) => {
  return twMerge(...args);
};

export default classes;
