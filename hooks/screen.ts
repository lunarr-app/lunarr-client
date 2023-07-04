import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";

export const useIsScreenSizeLarge = (breakpoint: number = 768) => {
  const windowDimensions = useWindowDimensions();
  const [isLarge, setIsLarge] = useState<boolean>(false);

  useEffect(() => {
    setIsLarge(windowDimensions.width >= breakpoint);
  }, [windowDimensions.width, breakpoint]);

  return isLarge;
};
