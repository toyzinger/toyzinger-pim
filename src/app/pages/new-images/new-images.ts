import { Component } from '@angular/core';
import { UploadImages } from '../../components/upload-images/upload-images';

@Component({
  selector: 'app-new-images',
  imports: [UploadImages],
  templateUrl: './new-images.html',
  styleUrl: './new-images.scss',
})
export class NewImages { }
