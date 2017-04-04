import { EarningAndProductivityVM } from './../vm/EarningAndProductivityVM';
import { D3, D3Service, Selection, BaseType } from 'd3-ng2-service';
import { Component, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements AfterViewInit {
  @Input() colors;
  @Input() max;
  @Input() min;
  @Input() _data = [];


  get data(): any[] {
    return this._data;
  }
  set data(value: any[]) {
    this._data = value;
    // console.log(this._data);
    this.xScale = this.d3.scaleLinear()
      .domain([1, 13])
      .range([this.margin.left, this.w - this.margin.left - this.margin.right]);
    this.yScale = this.d3.scaleLinear()
      .domain([0, 100000])
      .range([this.h - this.margin.top - this.margin.bottom - this.padding, this.margin.top + this.padding]);

    this.bind(this.yearsBar);
  }
  yearsBar: number = 1991;
  d3: D3;
  @ViewChild('container') container: ElementRef;
  margin = { top: 30, right: 30, bottom: 30, left: 30 };
  padding = 40;
  w = 800;
  h = 400;
  r = 6;
  svg: Selection<BaseType, {}, null, undefined>;
  xScale;
  yScale;
  lineSub: Subscription;
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

    this.callAxis();
  }

  callAxis() {
    let axisXScale = this.d3.scaleLinear()
      .domain([1, 12])
      .range([this.margin.left + this.padding - 10, this.w - this.margin.left - this.margin.right - this.padding - this.r + 20]);
    let axisYScale = this.d3.scaleLinear()
      .domain([0, 100000])
      .range([this.h - this.margin.top - this.margin.bottom - this.padding, this.margin.top + this.padding]);
    // X軸
    let axisX = this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${this.h - this.margin.top - this.margin.bottom - this.padding})`)
      .call(this.d3.axisBottom(axisXScale));
    // Y軸
    let axisY = this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${this.margin.left + 12},0)`)
      .call(this.d3.axisLeft(axisYScale).tickFormat(function (d: number) {
        return d / 1000 + 'K';
      }));
  }

  bind(year) {
    let industryData = this.data.map(x => x.行業)
      .filter((d, i, data) => data.indexOf(d) === i)
      .map(industry => this.data.filter(x => x.時間.getFullYear() === year && x.行業 === industry));
    let source = Observable.from(industryData).map(
      x => Observable.interval(60).take(13).map(n => x.slice(0, n))
    ).mergeAll().bufferTime(60);
    if (this.lineSub) {
      this.lineSub.unsubscribe();
    }

    this.lineSub = source.subscribe(res => {
      let circles, lines;
      if (res.length > 0) {
        circles = this.svg.selectAll('circle').data(res.reduce((acc, x) => acc.concat(x)));
        lines = this.svg.selectAll('line.data-line').data(res.map(x => x.slice(0, x.length - 1)).reduce((acc, x) => acc.concat(x)));
      } else {
        circles = this.svg.selectAll('circle').data([]);
        lines = this.svg.selectAll('line.data-line').data([]);
      }
      circles.exit().remove();
      circles.enter().append('circle');
      lines.exit().remove();
      lines.enter().append('line').classed('data-line', true);
      this.render(industryData.length > 0 ? industryData.reduce((acc, x) => acc.concat(x)) : []);
      this.bindEvents();
    });
  }

  render(industryData: any[]) {
    this.svg.selectAll('circle')
      .attrs({
        cx: (d: any) => this.margin.left + this.xScale(d.時間.getMonth() + 1),
        cy: (d: any) => this.yScale(d.經常性薪資),
        r: this.r,
        fill: (d: any) => this.colors.find(x => x.name === d.行業).color,
        stroke: '#666666',
        'stroke-width': 3
      })
      .style('display', 'none')
      .transition()
      .duration(60)
      .style('display', '');

    this.svg.selectAll('line.data-line')
      .attrs({
        x1: (d: any) => this.margin.left + this.xScale(d.時間.getMonth() + 1),
        y1: (d: any) => this.yScale(d.經常性薪資),
        x2: (d: any) => this.margin.left + this.xScale(d.時間.getMonth() + 1 + 1),
        y2: (d: any) => {
          let data = industryData.filter(x => x.行業 === d.行業).map(x => x.經常性薪資);
          let index = data.indexOf(d.經常性薪資);
          if (index < data.length - 1) {
            return this.yScale(data[index + 1]);
          } else {
            return '';
          }
        },
        stroke: (d: any) => this.colors.find(x => x.name === d.行業).color,
        'stroke-width': 3
      })
      .style('display', 'none')
      .transition()
      .duration(60)
      .style('display', '');

    this.svg.selectAll('circle').raise();
  }

  bindEvents() {
    this.svg.selectAll('circle')
      .on('mouseover', (d: any, i, data) => {
        this.d3.select(this.d3.event.target).raise();
        let point = this.d3.mouse(this.d3.event.target);

        // console.log(d.經常性薪資);
        let tooltip = this.d3.select('#tooltip');
        tooltip.select('.title').text(d.行業);
        tooltip.select('.content_1').text(`經常性薪資：${Number(d.經常性薪資).toLocaleString()} 元`);
        tooltip.select('.content_2').text(`男：${Number(d.經常性薪資_男).toLocaleString()} 元`);
        tooltip.select('.content_3').text(`女：${Number(d.經常性薪資_女).toLocaleString()} 元`);
        tooltip.style('visibility', 'visible');
      })
      .on('mousemove', (d: any, i, data) => {
        let point = this.d3.mouse(this.d3.event.target);
        this.d3.select('#tooltip')
          .styles({
            transform: `translate(${point[0] + 1}px,${point[1] + 1}px)`
          });
      })
      .on('mouseout', (d: any, i, data) => {
        this.d3.select('#tooltip').style('visibility', 'hidden');
      });
  }

  playAndPause() {
    if (this.playSub) {
      this.playSub.unsubscribe();
      this.playSub = undefined;
    } else {
      this.playSub = Observable.interval(1000).takeWhile(() => this.yearsBar < 2016).subscribe(
        () => this.yearsBar++,
        null,
        () => this.playSub = undefined
      );
    }
  }

  yearChange(year) {
    this.bind(year);
  }

}
