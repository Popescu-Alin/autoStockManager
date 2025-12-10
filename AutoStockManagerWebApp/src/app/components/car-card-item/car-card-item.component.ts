import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { carouselConfig } from '../../config/carousel.config';
import { Router } from '@angular/router';

export interface CarCardData {
  id: number;
  brand: string;
  model: string;
  manufactureYear: number;
  price: number;
  images?: string[];
  supplierName?: string;
}

@Component({
  selector: 'app-car-card-item',
  standalone: true,
  imports: [CommonModule, CarouselModule, CardModule, TagModule],
  templateUrl: './car-card-item.component.html',
  styleUrl: './car-card-item.component.css',
})
export class CarCardItemComponent {
  @Input() car!: CarCardData;

  carouselResponsiveOptions = carouselConfig;

  constructor(public router: Router){}


  get defaultImages(): string[] {
    return [
      'https://via.placeholder.com/400x300?text=Car+Image+1',
      'https://via.placeholder.com/400x300?text=Car+Image+2',
      'https://via.placeholder.com/400x300?text=Car+Image+3',
    ];
  }

  get carImages(): string[] {
    return this.car?.images && this.car.images.length > 0 ? this.car.images : this.defaultImages;
  }

  navigateToDetails(carId: number){
    this.router.navigate(['/cars', carId]);
  }
}
