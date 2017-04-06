import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { D3Service } from 'd3-ng2-service';
import { TreemapComponent } from './treemap/treemap.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';

import { NouisliderModule } from 'ng2-nouislider';
import { LineChartAvgHoursComponent } from './line-chart-avg-hours/line-chart-avg-hours.component';

@NgModule({
  declarations: [
    AppComponent,
    TreemapComponent,
    LineChartComponent,
    BarChartComponent,
    PieChartComponent,
    LineChartAvgHoursComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NouisliderModule
  ],
  providers: [D3Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
