import { D3, D3Service } from 'd3-ng2-service';
import { Component, AfterViewInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-treemap',
  templateUrl: './treemap.component.html',
  styleUrls: ['./treemap.component.scss']
})
export class TreemapComponent implements AfterViewInit {
  @ViewChild('container') container: ElementRef;
  @Input() single = false;
  @Output() select = new EventEmitter();
  d3: D3;
  data = [
    { name: '資訊及通訊傳播業', parent: null },
    { name: '出版業', parent: '資訊及通訊傳播業' },
    { name: '影片服務、聲音錄製及音樂出版業', parent: '資訊及通訊傳播業' },
    { name: '傳播及節目播送業', parent: '資訊及通訊傳播業' },
    { name: '電信業', parent: '資訊及通訊傳播業' },
    { name: '電腦系統設計、資料處理及資訊供應服務業', parent: '資訊及通訊傳播業' },
    { name: '電腦系統設計服務業', parent: '資訊及通訊傳播業' },
    { name: '資料處理及資訊供應服務業', parent: '資訊及通訊傳播業' },
  ];
  circle: any;
  selectItem: string[] = ['資訊及通訊傳播業'];
  margin = { top: 20, right: 90, bottom: 30, left: 150 };
  width = 550 - this.margin.left - this.margin.right;
  height = 350 - this.margin.top - this.margin.bottom;

  constructor(private d3Service: D3Service) {
    this.d3 = d3Service.getD3();
  }

  ngAfterViewInit() {
    let treemap = this.d3.tree().size([300, 100]);

    let treeData = this.d3.stratify()
      .id(function (d: any) { return d.name; })
      .parentId(function (d: any) { return d.parent; })
      (this.data);

    treeData.each(function (d: any) {
      d.name = d.id;
    });

    let nodes: any = this.d3.hierarchy(treeData, function (d) {
      return d.children;
    });

    nodes = treemap(nodes);

    this.render(nodes);

  }

  render(nodes) {
    let svg = this.d3.select(this.container.nativeElement).append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    let g = svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    var link = g.selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', function (d: any) {
        return 'M' + d.y + ',' + d.x
          + 'C' + (d.y + d.parent.y) / 2 + ',' + d.x
          + ' ' + (d.y + d.parent.y) / 2 + ',' + d.parent.x
          + ' ' + d.parent.y + ',' + d.parent.x;
      });

    // adds each node as a group
    var node = g.selectAll('.node')
      .data(nodes.descendants())
      .enter().append('g')
      .attr('class', function (d: any) {
        return 'node' +
          (d.children ? ' node--internal' : ' node--leaf');
      })
      .attr('transform', function (d: any) {
        return 'translate(' + d.y + ',' + d.x + ')';
      });

    // adds the circle to the node
    this.circle = node.append('circle')
      .attr('r', 10)
      .attr('fill', '#fff');

    // adds the text to the node
    node.append('text')
      .attr('dy', '.35em')
      .attr('x', function (d: any) { return d.children ? -13 : 13; })
      .style('text-anchor', function (d: any) {
        return d.children ? 'end' : 'start';
      })
      .text(function (d: any) { return d.data.name; });

    let colors = this.d3.schemeCategory10;
    this.circle.attr('fill', (d, i) =>
      this.selectItem.indexOf(this.data[i].name) > -1
        ? colors[i]
        : '#fff'
    );

    // bind event
    if (this.single) {
      node.on('click', (d, i, data) => {
        let text = this.d3.select(data[i]).text();
        if (this.selectItem.indexOf(text) > -1) {
          return;
        }
        this.selectItem = [text];

        this.select.emit(this.selectItem);

        this.circle.attr('fill', (d, i) =>
          this.selectItem.indexOf(this.data[i].name) > -1
            ? colors[i]
            : '#fff'
        );
      });
    } else {
      node.on('click', (d, i, data) => {
        let text = this.d3.select(data[i]).text();
        let index = this.selectItem.indexOf(text);
        index > -1
          ? this.selectItem.splice(index, 1)
          : this.selectItem.push(text);

        this.select.emit(this.selectItem);

        this.circle.attr('fill', (d, i) =>
          this.selectItem.indexOf(this.data[i].name) > -1
            ? colors[i]
            : '#fff'
        );
      });
    }

  }

}
