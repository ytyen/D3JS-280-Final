import { EarningAndProductivityVM } from './vm/EarningAndProductivityVM';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { D3Service, D3, Selection } from 'd3-ng2-service';
import { Http } from '@angular/http';
import 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('container') container: ElementRef;
  d3: D3;
  svg: any;
  data: EarningAndProductivityVM[];

  constructor(private d3Service: D3Service, private http: Http) {
    this.d3 = d3Service.getD3();
  }

  ngOnInit() {
    this.http.get('assets/data.csv').subscribe(
      (res: any) => {
        this.data = this.d3.csvParse(res._body, (d: any) => {
          Object.keys(d)
            .filter(x => x !== '時間(月)' && x !== '行業')
            .forEach(x => d[x] = +d[x] || 0);
          return d;
        });
        // console.log(this.data.map(d => d.行業)
        // .filter((d, i, data) => data.indexOf(d) === i));
      },
      (err) => {
        alert('資料載入失敗，請重新整理。');
      }
    );
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

  selectIndustry(selectData: string[]) {
    console.log(this.data.filter(x => selectData.indexOf(x.行業) > -1).length);
  }

}
