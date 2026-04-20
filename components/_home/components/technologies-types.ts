export type CardImage = {
  src: string;
  alt: string;
};

export type CardImagePosition = {
  objectPosition?: string;
  scale?: number;
};

export type Card = {
  id: string;
  name: string;
  description: string;
  image: CardImage;
  color: string;
  imagePosition?: CardImagePosition;
};
