import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'product/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'franchise/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'collection/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'subcollection/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'manufacturer/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
