import { Component } from '@angular/core';

@Component({
  selector: 'app-add-images',
  imports: [],
  templateUrl: './add-images.html',
  styleUrl: './add-images.scss',
})
export class AddImages {
  isDragOver = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    console.log('File dropped', event.dataTransfer?.files);
  }
}
