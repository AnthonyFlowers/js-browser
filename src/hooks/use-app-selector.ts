import { useSelector } from "react-redux";
import type { RootState } from "../state";

export const useAppSelector = useSelector.withTypes<RootState>();
