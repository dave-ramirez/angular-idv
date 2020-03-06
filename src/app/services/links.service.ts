import { Injectable } from '@angular/core';
import { VoxelNativeCommunicationService } from '@voxel/native-communication';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ILinksResponse {
  linksUteis: Array<{
    texto: string;
    icone: string;
    url: string;
  }>;
}

export interface ILinks {
  label: string;
  classIcon: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class LinksService {
  constructor(
    private voxelNative: VoxelNativeCommunicationService,
  ) { }

  getLinks(): Observable<ILinks[]> {
    return this.voxelNative.routerRequest<ILinksResponse>({
      op: 'LINKS_OP',
      method: 'POST',
    }).pipe(
      map((result: ILinksResponse) => result.linksUteis.map(({ texto, icone, url }) => ({
        label: texto,
        classIcon: icone,
        url,
      })),
    ));
  }

}
