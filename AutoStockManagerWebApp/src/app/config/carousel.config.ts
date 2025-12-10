import { CarouselResponsiveOptions } from 'primeng/carousel';

export const carouselConfig: CarouselResponsiveOptions[] = [
  {
    breakpoint: '1024px',
    numVisible: 3,
    numScroll: 3,
  },
  {
    breakpoint: '768px',
    numVisible: 2,
    numScroll: 2,
  },
  {
    breakpoint: '560px',
    numVisible: 1,
    numScroll: 1,
  },
];

export const carouselSettings = {
  value: [],
  numVisible: 3,
  numScroll: 3,
  circular: false,
  autoplayInterval: 0,
  responsiveOptions: carouselConfig,
  showIndicators: true,
  showNavigators: true,
};
