import type { RawDecorator } from "../types";

export type DecoratorSource = {
  id: string;
  displayName: string;
  search(city: string, radiusMiles: number): Promise<RawDecorator[]>;
  fetchPortfolio?(
    decorator: RawDecorator,
  ): Promise<
    Array<{
      id: string;
      url: string;
      attribution: string | null;
      width: number | null;
      height: number | null;
    }>
  >;
  attribution: string;
  respectsRobots: boolean;
};
