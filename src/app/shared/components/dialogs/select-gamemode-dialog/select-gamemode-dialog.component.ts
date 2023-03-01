import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameIndex } from 'src/app/shared/constants/game_index_constants';
import { MapGroup } from 'src/app/shared/interfaces/map-group.interface';
import { MapService } from 'src/app/shared/services/map/map.service';
import { MapGroupService } from 'src/app/shared/services/map-group/map-group.service';
import { Map } from 'src/app/shared/interfaces/Map.interface';
import { Observable, of, zip } from "rxjs";
import { switchMap, map } from "rxjs/operators";

@Component({
  selector: 'app-select-gamemode-dialog[mapGroup][startPlayingForm.controls.selectedMapId]',
  templateUrl: './select-gamemode-dialog.component.html',
  styleUrls: ['./select-gamemode-dialog.component.scss']
})
export class SelectGamemodeDialogComponent implements OnInit {

  availableMaps$: Observable<CustomMapGroup[]> = of([]);

  gameIndex = GameIndex;

  startPlayingForm = new FormGroup({
    selectedMapId: new FormControl<string>('', Validators.required),
    selectedGameId: new FormControl<string>(''),
  });

  constructor(public dialogRef: MatDialogRef<SelectGamemodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { selectedMap: Map, mapGroup: MapGroup },
    private mapService: MapService,
    private mapGroupService: MapGroupService) {
  }

  ngOnInit(): void {
    this.availableMaps$ = this.mapGroupService.getMapGroup$().pipe(
      switchMap(mapGroups =>
        zip(
          mapGroups.map(mapGroup =>
            this.getMapsFromGroup(mapGroup.mapGroupId).pipe(
              map((maps): CustomMapGroup => {
                let result = (mapGroup as CustomMapGroup)
                result.maps = maps
                return result
              })
            )
          )
        )
      ),
    )
    this.startPlayingForm.controls.selectedMapId.setValue(this.data.selectedMap.id);
    this.startPlayingForm.controls.selectedGameId.setValue(this.gameIndex[0].id)
  }

  setSelectedMode(mapIndexId: string) {
    this.startPlayingForm.controls.selectedGameId.setValue(mapIndexId);
  }

  close(data?: { mapId: string, gameId: string }) {
    this.dialogRef.close(data);
  }

  play() {
    this.close({ mapId: this.startPlayingForm.controls.selectedMapId.value ?? "", gameId: this.startPlayingForm.controls.selectedGameId.value ?? "" })
  }

  getMapsFromGroup(id: string) {
    return this.mapService.getMapsFromGroup(id);
  }

}


type CustomMapGroup = MapGroup & { maps?: Map[] }
