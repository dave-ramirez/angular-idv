import { Component, OnInit } from '@angular/core';
import { Signature } from '../shared/signatures/signatures';
import { VoxelNativeCommunicatorService } from '../shared/communicator/voxel/voxel-native.communicator.service';
import { CommunicatorService } from '../shared/communicator/communicator.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  example: any;

  strategy = this.communicator.strategy.name;


  constructor(
    private voxelNative: VoxelNativeCommunicatorService,
    private communicator: CommunicatorService
    ) { }

  ngOnInit() {
    this.voxelNative.doRequestNative(new Signature()).subscribe(res => {
      this.example = res;
    });
    
    this.strategySet(this.strategy);
  }

  strategySet(strategy: string) {
    if (strategy === 'Router') {
      this.communicator.routerSelect();
    } else if (strategy === 'Native') {
      this.communicator.nativeSelect();
    }
  }


}
