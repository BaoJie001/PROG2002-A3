import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { environment } from '../environments/environment';

/**
 * App - the shell every page is rendered inside.
 *
 * The navigation lives here, so it appears on every page by definition (the
 * brief asks for exactly that on the admin side, and it is good practice on
 * the public side too).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly siteName = environment.siteName;

  /**
   * Where the admin site lives. In development it is a second dev server on
   * port 4201; once deployed it is a sub-folder of the same domain, which is
   * why the production value is relative.
   */
  readonly adminUrl = environment.adminUrl;

  readonly year = new Date().getFullYear();
  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
