import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarPart, CarPartsService } from '../../services/car-parts.service';
import { CarsService } from '../../services/cars.service';
import { CarDto, CarPartDto } from '../../../api/src/api/api-client';

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './car-details.component.html',
  styleUrl: './car-details.component.css',
})
export class CarDetailsComponent implements OnInit {
  car: CarDto | undefined = undefined;
  carParts: CarPartDto[] = [];
  isLoading: boolean = true;
  carId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carsService: CarsService,
    private carPartsService: CarPartsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.carId = this.route.snapshot.paramMap.get('id');

    if (!this.carId) {
      this.router.navigate(['/home']);
      return;
    }

    await this.loadCarDetails();
  }

  async loadCarDetails(): Promise<void> {
    this.isLoading = true;

    try {
      const car = await this.carsService.getById(parseInt(this.carId!, 10));
      if (!car) {
        this.router.navigate(['/home']);
        return;
      }

      this.car = car;
      this.carParts = await this.carPartsService.getByCarId(parseInt(this.carId!, 10));
    } catch (error) {
      console.error('Error loading car details:', error);
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}
