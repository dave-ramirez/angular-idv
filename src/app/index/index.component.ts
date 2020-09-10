import { Component, OnInit } from '@angular/core';
import { Signature } from '../shared/signatures/signatures';
import { NativeCommunicatorService } from '../shared/communicator/native/native.communicator.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  example: any;

  constructor(private native: NativeCommunicatorService) { }

  ngOnInit() {

    //Ejemplo de llamada a algun servicio
    /*********************************************
     *  this.native.doRequestNative(new Signature()).subscribe(res => {
     *    this.example = JSON.stringify(res);
     *  });
    **********************************************/

  }
}
