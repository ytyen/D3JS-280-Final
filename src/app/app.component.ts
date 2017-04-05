import { BarChartComponent } from './bar-chart/bar-chart.component';
import { Observable } from 'rxjs/Observable';
import { LineChartComponent } from './line-chart/line-chart.component';
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
  @ViewChild('lineChart') lineChart: LineChartComponent;
  @ViewChild('barChart') barChart: BarChartComponent;
  d3: D3;
  data: EarningAndProductivityVM[];
  colors: Array<{ name: string, color: string }>;

  constructor(private d3Service: D3Service, private http: Http) {
    this.d3 = d3Service.getD3();
  }

  ngOnInit() {
    this.http.get('assets/data.csv').subscribe(
      (res: any) => {
        this.data = this.d3.csvParse(res._body, (d: any) => {
          Object.keys(d)
            .filter(x => x !== '時間' && x !== '行業')
            .forEach(x => d[x] = +d[x] || 0);
          let time = d.時間.split('/');
          time[0] = +time[0] + 1911;
          d.時間 = new Date(time.join('/'));
          return d;
        });
        let colors = this.d3.schemeCategory10;
        this.colors = this.data.map(x => x.行業)
          .filter((d, i, data) => data.indexOf(d) === i)
          .map((d, i) => { return { name: d, color: colors[i] }; });

        // Init Line Chart
        this.lineChart.colors = this.colors;
        this.lineChart.max = this.d3.max(this.data, (d) => d.經常性薪資);
        this.lineChart.min = this.d3.min(this.data, (d) => d.經常性薪資);
        this.initLineChart();
        // Init Bar Chart
        this.barChart.colors = this.colors;
        this.barChart.max = this.d3.max(this.data, (d) => d.平均工時);
        this.barChart.min = this.d3.min(this.data, (d) => d.平均工時);
        this.initBarChart();
      },
      (err) => {
        alert('資料載入失敗，請重新整理。');
      }
    );
  }

  ngAfterViewInit() {

  }

  initLineChart() {
    let data = this.data.filter(x => x.行業 === '資訊及通訊傳播業');
    this.lineChart.selectData = ['資訊及通訊傳播業'];
    this.lineChart.data = data.map(x => {
      return {
        時間: x.時間,
        行業: x.行業,
        經常性薪資: x.經常性薪資,
        經常性薪資_男: x.經常性薪資_男,
        經常性薪資_女: x.經常性薪資_女
      };
    });
  }

  initBarChart() {
    let data = this.data.filter(x => x.行業 === '資訊及通訊傳播業');
    this.barChart.selectData = ['資訊及通訊傳播業'];
    this.barChart.data = data.map(x => {
      return {
        時間: x.時間,
        行業: x.行業,
        平均工時: x.平均工時,
        平均工時_男: x.平均工時_男,
        平均工時_女: x.平均工時_女
      };
    });
  }

  selectIndustry(selectData: string[]) {
    let data = this.data.filter(x => selectData.indexOf(x.行業) > -1);
    // Line Chart
    this.lineChart.selectData = selectData;
    this.lineChart.data = data.map(x => {
      return {
        時間: x.時間,
        行業: x.行業,
        經常性薪資: x.經常性薪資,
        經常性薪資_男: x.經常性薪資_男,
        經常性薪資_女: x.經常性薪資_女
      };
    });
  }

}
