import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register('/assets/sw.js')

        .then((reg) => console.log("Service Worker registered:", reg.scope))
        .catch((err) => console.log("Service Worker registration failed:", err));
    });
  }
  