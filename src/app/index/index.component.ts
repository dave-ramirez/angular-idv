import { Component, OnInit } from '@angular/core';
import { Signature } from '../shared/signatures/signatures';
import { VoxelNativeCommunicatorService } from '../shared/communicator/voxel/voxel-native.communicator.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  example: any;

  constructor(private voxelNative: VoxelNativeCommunicatorService) { }

  ngOnInit() {
    this.voxelNative.metodo(new Signature()).subscribe(res => {
      this.example = res;
    });
  }

}
