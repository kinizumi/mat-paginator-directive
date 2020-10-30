import {
  AfterViewInit,
  Directive,
  EventEmitter,
  Host,
  Input,
  OnChanges,
  Optional,
  Output,
  Renderer2,
  Self,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

@Directive({
  selector: '[appStylePaginator]',
})
export class StylePaginatorDirective implements AfterViewInit, OnChanges {
  @Output() btnClicked: EventEmitter<any> = new EventEmitter();
  @Input() currentPage;
  private pageGapTxt = '...';
  private rangeStart;
  private rangeEnd;
  private buttons = [];
  private totalPages = 2;

  constructor(
    @Host() @Self() @Optional() private readonly matPag: MatPaginator,
    private vr: ViewContainerRef,
    private ren: Renderer2
  ) {
    // Sub to rerender buttons when next page and last page is used
    if (this.matPag) {
      this.matPag.page.subscribe((v) => {
        this.switchPage(v.pageIndex);
      });
    }
  }

  @Input()
  get showTotalPages(): number {
    return this.totalPages;
  }

  set showTotalPages(value: number) {
    this.totalPages = value % 2 === 0 ? value + 1 : value;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes[`currentPage`] && this.currentPage > -1) {
      this.matPag.pageIndex = this.currentPage;
      this.initPageRange();
    }
  }

  ngAfterViewInit() {
    this.initPageRange();
  }

  private buildPageNumbers() {
    const actionContainer = this.vr.element.nativeElement.querySelector('div.mat-paginator-range-actions');
    const nextPageNode = this.vr.element.nativeElement.querySelector('button.mat-paginator-navigation-next');

    //  remove buttons before creating new ones
    if (this.buttons.length > 0) {
      this.buttons.forEach((button) => {
        this.ren.removeChild(actionContainer, button);
      });
      // Empty state array
      this.buttons.length = 0;
    }

    // initialize next page and last page buttons
    if (this.buttons.length === 0) {
      const nodeArray = this.vr.element.nativeElement.childNodes[0].childNodes[0].childNodes[2]?.childNodes;
      setTimeout(() => {
        for (const i in nodeArray?.length) {
          if (nodeArray[i].nodeName === 'BUTTON') {
            if (nodeArray[i].disabled) {
              this.ren.setStyle(nodeArray[i], 'background-color', 'rgba(190, 130, 130, 1)');
              this.ren.setStyle(nodeArray[i], 'color', 'white');
              this.ren.setStyle(nodeArray[i], 'margin', '.5%');
            } else {
              this.ren.setStyle(nodeArray[i], 'background-color', 'rgba(255, 0, 0, 1)');
              this.ren.setStyle(nodeArray[i], 'color', 'white');
              this.ren.setStyle(nodeArray[i], 'margin', '.5%');
            }
          }
        }
      });
    }

    let dots = false;

    for (let i = 0; i < this.matPag.getNumberOfPages(); i++) {
      if (
        (i < this.totalPages && this.currentPage < this.totalPages && i > this.rangeStart) ||
        (i >= this.rangeStart && i <= this.rangeEnd)
      ) {
        this.ren.insertBefore(actionContainer, this.createButton(i, this.matPag.pageIndex), nextPageNode);
      } else {
        if (i > this.rangeEnd && !dots) {
          this.ren.insertBefore(
            actionContainer,
            this.createButton(this.pageGapTxt, this.matPag.pageIndex),
            nextPageNode
          );
          dots = true;
        }
      }
    }
  }

  private createButton(i: any, pageIndex: number): any {
    const linkBtn = this.ren.createElement('mat-button');
    this.ren.addClass(linkBtn, 'mat-mini-fab');
    this.ren.setStyle(linkBtn, 'margin', '1%');

    const pagingTxt = isNaN(i) ? this.pageGapTxt : +(i + 1);
    const text = this.ren.createText(pagingTxt + '');

    this.ren.addClass(linkBtn, 'mat-custom-page');
    switch (i) {
      case pageIndex:
        this.ren.setAttribute(linkBtn, 'disabled', 'disabled');
        break;
      case this.pageGapTxt:
        this.ren.listen(linkBtn, 'click', () => {
          this.switchPage(this.currentPage + this.totalPages);
        });
        break;
      default:
        this.ren.listen(linkBtn, 'click', () => {
          this.switchPage(i);
        });
        break;
    }

    this.ren.appendChild(linkBtn, text);
    // Add button to private array for state
    this.buttons.push(linkBtn);
    return linkBtn;
  }

  private initPageRange(): void {
    this.rangeStart = this.currentPage - this.totalPages / 2;
    this.rangeEnd = this.currentPage + this.totalPages / 2;
    this.buildPageNumbers();
  }

  private switchPage(i: number): void {
    this.currentPage = i;
    this.matPag.pageIndex = i;
    this.btnClicked.emit(i);
    this.initPageRange();
  }
}
/**call directive in <mat-paginator to apply it**/
