import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-title-page',
  imports: [RouterLink],
  templateUrl: './title-page.html',
  styleUrl: './title-page.scss',
})
export class TitlePage {
  title = input.required<string>();
  subtitle = input<string>();
  backRoute = input<string>();
}
