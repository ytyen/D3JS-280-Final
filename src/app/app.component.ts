import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { D3Service, D3, Selection } from 'd3-ng2-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('container') container: ElementRef;
  d3: D3;
  svg: any;

  constructor(private d3Service: D3Service){
    this.d3 = d3Service.getD3();
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.svg = this.d3.select(this.container.nativeElement).append('svg')
      .attrs({
        width: 800,
        height: 600
      })
      .styles({
        'background-color': 'red'
      });
  }

}
