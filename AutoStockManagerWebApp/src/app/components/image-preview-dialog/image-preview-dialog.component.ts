import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-image-preview-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './image-preview-dialog.component.html',
  styleUrl: './image-preview-dialog.component.css',
})
export class ImagePreviewDialogComponent {
  @Input() visible: boolean = false;
  @Input() imageUrl: string = '';
  @Input() imageTitle: string = 'Image Preview';
  @Output() visibleChange = new EventEmitter<boolean>();

  onDialogHide() {
    this.visibleChange.emit(false);
  }

  downloadImage() {
    if (this.imageUrl) {
      const link = document.createElement('a');
      link.href = this.imageUrl;
      link.download = this.imageTitle || 'image';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
