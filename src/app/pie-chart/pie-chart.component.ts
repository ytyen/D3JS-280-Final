import { EarningAndProductivityVM } from './../vm/EarningAndProductivityVM';
import { D3, D3Service, Selection, BaseType } from 'd3-ng2-service';
import { Component, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements AfterViewInit {
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
    this.bind(this.getYearsData(this.data), this.selectYear);
  }
  selectYear: number = 1991;
  d3: D3;
  @ViewChild('container') container: ElementRef;
  margin = { top: 35, right: 30, bottom: 35, left: 30 };
  padding = 50;
  w = 900;
  h = 450;
  svg: Selection<BaseType, {}, null, undefined>;
  playSub: Subscription;
  constructor(private d3Service: D3Service) {
    this.d3 = d3Service.getD3();
  }

  ngAfterViewInit() {
    this.svg = this.d3.select(this.container.nativeElement)
      .append('svg')
      .attrs({
        width: this.w - this.margin.left - this.margin.right,
        height: this.h - this.margin.top - this.margin.bottom
      });
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

  playAndPause() {
    if (this.playSub) {
      this.playSub.unsubscribe();
      this.playSub = undefined;
    } else {
      this.playSub = Observable.interval(1000).takeWhile(() => this.selectYear < 2016).subscribe(
        () => this.selectYear++,
        null,
        () => this.playSub = undefined
      );
    }
  }

  yearChange(year) {
    this.bind(this.getYearsData(this.data), year);
  }

  bind(models: any[], year = null) {
    let data = models.filter(x => x.時間.getFullYear() === year);
    let pie = this.d3.pie().value((d: any) => d.受僱員工人數);

    let selection = this.svg
      .selectAll('g.arc')
      .data(pie(data));

    selection.exit().remove();
    let g_arc = selection.enter();
    g_arc.append('g').attr('class', 'arc');
    g_arc.append('path');
    g_arc.append('text');

    this.render();
    // this.bindEvents();
  }

  render() {
    let outerR = 300;
    let innerR = 0;
    let arc = this.d3.arc()
      .outerRadius(outerR)
      .innerRadius(innerR);

    this.svg.selectAll('g.arc')
      .attr('transform', `translate(${this.w / 2}, ${this.h / 2})`)
      .select('path')
      .attr('d', arc)
      .style('fill', (d: any) => this.colors.find(x => x.name === d.data.行業).color);

    this.svg.selectAll('g.arc')
      .select('text')
      .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .text((d: any) => d.data.行業);
  }

  bindEvents() {
    this.svg.selectAll('circle')
      .on('mouseover', (d: any, i, data) => {
        let point = this.d3.mouse(this.d3.event.target);

        // console.log(d.受僱員工人數);
        let tooltip = this.d3.select(this.container.nativeElement).select('#tooltip');
        tooltip.select('.title').text(d.行業);
        tooltip.select('.year').text(d.時間.getFullYear());
        tooltip.select('.content_1').text(`受僱員工人數：${Number(d.受僱員工人數).toLocaleString()} 人`);
        tooltip.select('.content_2').text(`男：${Number(d.受僱員工人數_男).toLocaleString()} 人`);
        tooltip.select('.content_3').text(`女：${Number(d.受僱員工人數_女).toLocaleString()} 人`);
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
        受僱員工人數: _.round(data.map(x => x.受僱員工人數).reduce(_.add) / data.length),
        受僱員工人數_女: _.round(data.map(x => x.受僱員工人數_女).reduce(_.add) / data.length),
        受僱員工人數_男: _.round(data.map(x => x.受僱員工人數_男).reduce(_.add) / data.length),
      };
    } else {
      return {
        時間: new Date(),
        行業: '',
        受僱員工人數: 0,
        受僱員工人數_女: 0,
        受僱員工人數_男: 0,
      };
    }
  }

}
