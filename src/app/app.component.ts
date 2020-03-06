import { Component } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import { LinksService } from './services/links.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private defaultTitle = 'Aplicação de Exemplo';
  title = this.defaultTitle;
  showBackBtn = true;
  icons = [ { icon: 'filtro', a11yLabel: 'filtro' } ];
  links$ = this.linksService.getLinks();

  constructor(
    private router: Router,
    private linksService: LinksService,
  ) {
    this.router.events.pipe(
      filter(e => e instanceof ActivationEnd),
      map((e: any) => e.snapshot.data),
    )
    .subscribe(data => {
      this.showBackBtn = !Boolean(data.hideBackBtn);
      this.title = data.title || this.defaultTitle;
    });
  }

  filter() {
    this.router.navigate(['/configurations']);
  }

  navigate($event: any) {
    const url = $event.link.url;
    (window as any).open(url, '_blank');
  }
}
