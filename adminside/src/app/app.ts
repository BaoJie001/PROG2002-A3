import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { environment } from '../environments/environment';

/**
 * App - the admin shell.
 *
 * The menu lives here rather than in each page, so it is present on every
 * screen automatically. It also links back to the public site, which is handy
 * during the demo: change an event, then jump across and see the change.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly siteName = environment.siteName;
  readonly publicUrl = environment.publicUrl;
  readonly year = new Date().getFullYear();
  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
