import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconService {

  constructor(
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.registerIcons();
  }

  private registerIcons() {
    this.matIconRegistry.addSvgIcon(
      'avatar',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/avatar.svg')
    );
  }
}