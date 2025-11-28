import { Component, input, output } from '@angular/core';
import { dimensionType } from '../../features/dimensions/dimensions.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dimension-info',
  imports: [CommonModule],
  templateUrl: './dimension-info.html',
  styleUrl: './dimension-info.scss',
})
export class DimensionInfo {
  type = input.required<dimensionType>();
  total = input<number>(0);
}
