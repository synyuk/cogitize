export type Asset = {
  id: number;
  symbol: string;
  name: string;
  assetImage: string;
};

export type AssetsResponse = {
  currentPage: number;
  data: Asset[];
  hasNextPage: boolean;
  maximumPages: number;
};

export type AssetsQueryArgs = {
  search?: string;
  page: number;
};
