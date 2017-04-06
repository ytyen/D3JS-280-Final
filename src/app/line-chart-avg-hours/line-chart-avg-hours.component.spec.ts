import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartAvgHoursComponent } from './line-chart-avg-hours.component';

describe('LineChartAvgHoursComponent', () => {
  let component: LineChartAvgHoursComponent;
  let fixture: ComponentFixture<LineChartAvgHoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineChartAvgHoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartAvgHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
