import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridLineComponent } from './grid-line.component';

describe('GridlineComponent', () => {
  let component: GridLineComponent;
  let fixture: ComponentFixture<GridLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridLineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
