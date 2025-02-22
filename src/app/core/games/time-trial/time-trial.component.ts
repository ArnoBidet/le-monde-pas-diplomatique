import { Component, HostListener, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import { HeaderDisplayService } from 'src/app/shared/services/header-display.service';
import { MapData } from 'src/app/shared/interfaces/MapData.interface';
import { Map } from 'src/app/shared/interfaces/Map.interface';
import { MapService } from 'src/app/shared/services/map/map.service';
import { FormControl } from '@angular/forms';
import { MapDataService } from 'src/app/shared/services/map-data/map-data.service';
import { replaceSpecialChars } from 'src/app/shared/utils/string.factory';
import { colorArea } from 'src/app/shared/components/map-generic/mapColorationUtils/colorArea';
import { AreaStatus } from 'src/app/shared/components/map-generic/mapColorationUtils/AreaStatus.enum';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-time-trial',
  templateUrl: './time-trial.component.html',
  styleUrls: ['./time-trial.component.scss']
})
export class TimeTrialComponent implements OnInit {

  areaSelected: MapData | undefined = undefined;
  currentMap$: Observable<Map | undefined> = of(undefined);
  currentSelected: MapData | undefined = undefined;
  userInput: FormControl<string | null> = new FormControl<string>("");
  toFindList: MapData[] = [];
  foundList: MapData[] = [];
  originList: MapData[] = [];
  currentLanguage = this.locale.replace(/-/, '_');
  displaySideMenu: boolean = false;
  mobileDisplay: boolean | undefined = (window.innerWidth < 1024 ? true : undefined);

  constructor(public dialog: MatDialog,
    private mapService: MapService,
    private headerDisplayService: HeaderDisplayService,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    private mapDataService: MapDataService,
    @Inject(LOCALE_ID) public locale: string) { }

  ngOnInit(): void {
    setTimeout(() => this.headerDisplayService.setPosition("relative"));
    this.route.queryParams.subscribe(queryParameter => {
      if (!queryParameter) return; // If there is no value then skip
      const mapId = queryParameter["mapId"];
      this.currentMap$ = this.mapService.getMap(mapId);
      this.mapDataService.getMapData(mapId).subscribe(e => {
        this.originList = e;
        this.toFindList = e;
      })
    })
  }
  ngOnDestroy(): void {
    this.headerDisplayService.setPosition("sticky");
  }

  /**
 * On scroll, if not top page, then blur header
 */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.mobileDisplay = window.innerWidth < 1024;
  }

  /**
   * When an area is selected, get its data an display informations
   * @param areaCommons An area data
   */
  onAreaSelected(areaCommons: MapData) {
    this.areaSelected = areaCommons;
  }
  onSelectedRow(mapData: MapData) {
    this.currentSelected = undefined;
    setTimeout(() => this.currentSelected = mapData); // force change detection
  }

  onInputChange() {
    const currentInput = replaceSpecialChars(this.userInput.value ?? "")
    const result = this.originList.find(e => e.label.find(el => replaceSpecialChars(el) === currentInput));

    // if no corresponding element in origin list then nothing happens
    if (!result) return;

    // If new result then adds it to found list
    if (!this.foundList.find(el => el.id === result?.id))
      return this.addFoundResult(result);

    // If an extanded name exists then stops
    if (this.extendedNameExist(currentInput, result)) return;

    // If already found then error message
    this.snackbarService.addMessage({ message: $localize`:@@time-trial-area-already-found:You've already found '${result.label[0]}'`, acceptButton: "Okay", options: { panelClass: ["error"], duration: 2000 } })
    this.clearInput();

  }


  private addFoundResult(result: MapData): void {
    this.foundList.push(result!);
    this.toFindList=this.toFindList.filter(e => e.id !== result!.id);
    this.currentSelected = result;
    colorArea(result.id, AreaStatus.FOUND);
    this.clearInput();
  }

  /**
     * Allows to know if an area which could be considered as an extension of an already found area exists.
     * E.g : "Loire" and "Loiret"
     * @param name : A name, the current input
     * @param found : The data supposedly corresponding to the given input
     * @returns True if one or more exists
     */
  public extendedNameExist(name: string, found: MapData): MapData | undefined {
    let sanitizedName = replaceSpecialChars(name);
    var regex = new RegExp('^' + sanitizedName + '.+');
    return this.toFindList.find(e => {
      if (found.id == e.id) return false; // if same line then skip. Cannot happen because supposedly remove fro toFindList
      return e.label.find(el => replaceSpecialChars(el).match(regex));
    });
  }

  clearInput() {
    this.userInput.reset("");
  }

  /**
   * TEST PURPOSE START
   */
  testAdd(max : number) {
    let index = 0;
    if(!this.toFindList[0])return;
    do {
      this.addFoundResult(this.toFindList[0]);
      index++;
    } while (index < max && this.toFindList[1]);
  }
  /**
   * TEST PURPOSE STOP
   */
}
