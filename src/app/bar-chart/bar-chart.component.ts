import { EarningAndProductivityVM } from './../vm/EarningAndProductivityVM';
import { D3, D3Service, Selection, BaseType } from 'd3-ng2-service';
import { Component, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements AfterViewInit {
  @Input() rawData;
  @Input() colors;
  @Input() max;
  @Input() min;
  @Input() selectData;
  @Input() _data = [];


  get data(): any[] {
    return this._data;
  }
  set data(value: any[]) {
    this._data = value;

    this.yScale = this.d3.scaleLinear()
      .domain([0, 300])
      .range([this.margin.top - this.padding, this.h - this.margin.top - this.margin.bottom - this.padding]);
    this.xScale = this.d3.scaleLinear()
      .domain([1991, 2016])
      .range([this.margin.left, this.w - this.margin.left - this.margin.right - this.padding]);
    this.bind(this.getYearsData(this.data));
  }
  d3: D3;
  @ViewChild('container') container: ElementRef;
  margin = { top: 35, right: 30, bottom: 35, left: 30 };
  padding = 50;
  w = 900;
  h = 450;
  barWidth = 18;
  svg: Selection<BaseType, {}, null, undefined>;
  xScale;
  yScale;
  lineSub: Subscription;
  playSub: Subscription;
  years: number[] = [];
  constructor(private d3Service: D3Service) {
    this.d3 = d3Service.getD3();
    for (let i = 0; i <= 2016 - 1991; i++) {
      this.years.push(1991 + i);
    }
  }

  ngAfterViewInit() {
    this.svg = this.d3.select(this.container.nativeElement)
      .append('svg')
      .attrs({
        width: this.w - this.margin.left - this.margin.right,
        height: this.h - this.margin.top - this.margin.bottom
      });

    this.callAxis();
  }

  selectIndustry(selectData: string[]) {
    let data = this.rawData.filter(x => selectData.indexOf(x.行業) > -1);
    this.selectData = selectData;
    this.data = data.map(x => {
      return {
        時間: x.時間,
        行業: x.行業,
        平均工時: x.平均工時,
        平均工時_男: x.平均工時_男,
        平均工時_女: x.平均工時_女
      };
    });
  }

  callAxis() {
    let axisXScale = this.d3.scaleLinear()
      .domain([1991, 2016])
      .range([this.margin.left + this.padding - 12, this.w - this.margin.left - this.margin.right - 12]);
    let axisYScale = this.d3.scaleLinear()
      .domain([0, 300])
      .range([this.h - this.margin.top - this.margin.bottom - this.padding, this.margin.top - 26]);

    // X軸
    let axisX = this.svg.append('g')
      .attr('class', 'axis yearAxis')
      .attr('transform', `translate(0,${this.h - this.margin.top - this.margin.bottom - this.padding})`)
      .call(this.d3.axisBottom(axisXScale).ticks(26).tickFormat(d => d.toString()))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-65)');
    // Y軸
    let axisY = this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${this.margin.left + 12},0)`)
      .call(this.d3.axisLeft(axisYScale).ticks(5).tickFormat(function (d: number) {
        return d.toString();
      }));
  }

  bind(models: any[], year = null) {
    let industryData: any[], number: number;

    industryData = models.map(x => x.行業)
      .filter((d, i, data) => data.indexOf(d) === i)
      .map(industry => models.filter(x => x.行業 === industry));
    number = _.max(industryData.map(x => x.length)) + 1;

    let source = Observable.from(industryData).map(
      x => Observable.interval(30).take(number).map(n => x.slice(0, n))
    ).mergeAll().bufferTime(30);

    if (this.lineSub) {
      this.lineSub.unsubscribe();
    }

    this.lineSub = source.subscribe(res => {
      let bar;
      if (res.length > 0) {
        bar = this.svg.selectAll('rect').data(res.reduce((acc, x) => acc.concat(x)));
      } else {
        bar = this.svg.selectAll('rect').data([]);
      }
      bar.exit().remove();
      bar.enter().append('rect');
      this.render(industryData.length > 0 ? industryData.reduce((acc, x) => acc.concat(x)) : []);
      this.bindEvents();
    });
  }

  render(industryData: any[]) {
    this.svg.selectAll('rect')
      .attrs({
        x: (d: any) => this.margin.left + this.xScale(d.時間.getFullYear()),
        y: (d: any) => this.h - this.margin.top - this.margin.bottom - this.padding - this.yScale(d.平均工時) - 1,
        width: this.barWidth,
        height: (d: any) => this.yScale(d.平均工時),
        fill: (d: any) => this.colors.find(x => x.name === d.行業).color,
        stroke: '#666666',
        'stroke-width': 3
      })
      .style('display', 'none')
      .transition()
      .duration(30)
      .style('display', '');
  }

  bindEvents() {
    let lineY;
    this.svg.selectAll('rect')
      .on('mouseover', (d: any, i, data) => {
        let point = this.d3.mouse(this.d3.event.target);

        // 增加輔助線
        // 動畫跑完才加
        if (this.lineSub && this.lineSub.closed) {
          // Y
          lineY = this.svg.append('line')
            .classed('help', true)
            .attrs({
              x1: this.margin.left + 12,
              y1: this.h - this.margin.top - this.margin.bottom - this.padding - this.yScale(d.平均工時) - 1,
              x2: this.w - this.margin.right,
              y2: this.h - this.margin.top - this.margin.bottom - this.padding - this.yScale(d.平均工時) - 1,
              stroke: '#333333',
              'stroke-width': 2,
              'stroke-dasharray': '5, 5',
              opacity: 0.8
            });
        }

        // console.log(d.平均工時);
        let tooltip = this.d3.select(this.container.nativeElement).select('#tooltip');
        tooltip.select('.title').text(d.行業);
        tooltip.select('.year').text(d.時間.getFullYear());
        tooltip.select('.content_1').text(`平均工時：${Number(d.平均工時).toLocaleString()} 小時`);
        tooltip.select('.content_2').text(`男：${Number(d.平均工時_男).toLocaleString()} 小時`);
        tooltip.select('.content_3').text(`女：${Number(d.平均工時_女).toLocaleString()} 小時`);
        tooltip.style('visibility', 'visible');
      })
      .on('mousemove', (d: any, i, data) => {
        let point = this.d3.mouse(this.d3.event.target);
        this.d3.select(this.container.nativeElement).select('#tooltip')
          .styles({
            transform: `translate(${point[0] + 5}px,${point[1] + 5}px)`
          });
      })
      .on('mouseout', (d: any, i, data) => {
        this.d3.select(this.container.nativeElement).select('#tooltip').style('visibility', 'hidden');
        lineY.remove();
      });
  }

  getYearsData(data: any[]): any[] {
    let yearGroup = _.groupBy(data, (x) => x.時間.getFullYear());
    let yearData = _.map(yearGroup, (d) => _.groupBy(d, (x) => x.行業));
    let yearDataResult = _.flatten(this.selectData.map(s => yearData.map(d => d[s]).map(this.calculateAvg))).filter((x: any) => x.行業);
    return yearDataResult;
  }

  calculateAvg(data: any[]) {
    if (data && data.length > 0) {
      return {
        時間: data[0].時間,
        行業: data[0].行業,
        平均工時: _.round(data.map(x => x.平均工時).reduce(_.add) / data.length),
        平均工時_女: _.round(data.map(x => x.平均工時_女).reduce(_.add) / data.length),
        平均工時_男: _.round(data.map(x => x.平均工時_男).reduce(_.add) / data.length),
      };
    } else {
      return {
        時間: new Date(),
        行業: '',
        平均工時: 0,
        平均工時_女: 0,
        平均工時_男: 0,
      };
    }
  }

}
