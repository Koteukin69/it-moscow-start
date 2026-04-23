import {ImageData} from "@/lib/types";

export type CardImagePosition = {
  objectPosition?: string;
  scale?: number;
};

export type Card = {
  id: string;
  name: string;
  description: string;
  image: ImageData;
  color: string;
  imagePosition?: CardImagePosition;
};
