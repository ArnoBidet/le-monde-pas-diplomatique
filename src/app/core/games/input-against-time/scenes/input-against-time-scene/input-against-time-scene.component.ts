import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimerService } from 'src/app/shared/services/game-mode-specific/timer.service';
import { GameModeType } from 'src/app/shared/utils/types/game-mode.type';
import { GameStatus } from 'src/app/shared/utils/enums/GameStatus.enum';
import { DataSubjectService } from 'src/app/shared/services/map-specific/data-subject.service';
import { GameModeMetaData } from 'src/app/shared/utils/interfaces/game-oriented/game-mode-meta-data.interface';
import { MapMetaData } from 'src/app/shared/utils/interfaces/map-oriented/map-meta-data.interface';
import { MapsType } from 'src/app/shared/utils/types/maps.type';
import { Area } from 'src/app/shared/utils/interfaces/map-oriented/area';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-input-against-time-scene',
  templateUrl: './input-against-time-scene.component.html',
  styleUrls: ['./input-against-time-scene.component.scss']
})
export class InputAgainstTimeSceneComponent implements OnInit {

	private subscriptions : {[key:string]:Subscription} = {};

	// Input attributes
	@Input() sourceData :  Area[] = [];
	@Input() gameModeMetadata : GameModeMetaData = GameModeType.GAME_CONSULT;
	@Input() mapMetaData : MapMetaData = MapsType.MAP_DEPARTEMENTS_FRANCE;
	// Two way binding attributes
	@Input() gameStatus: GameStatus = GameStatus.START;
	@Output() gameStatusChange : EventEmitter<GameStatus> = new EventEmitter<GameStatus>();
	// Output attributes
	@Output() finalData : Area[] = [];
  
  	// Data storage for child component data sharing
	public currentData : Area | undefined = undefined;
	public currentTimerValue : number = 0;
	public timerPerValue : number = 10;
  

	constructor(protected route: ActivatedRoute,protected router: Router,protected dataSubjectService : DataSubjectService,protected timerService : TimerService) {
		this.subscriptions.currentDataChange = this.dataSubjectService.getCurrentDataChange().subscribe(value=> this.processCurrentDataChange(value));
		this.subscriptions.finalDataChange = this.dataSubjectService.getFinalDataChange().subscribe(value=> this.processFinalDataChange(value));
		this.dataSubjectService.setsourceDataValue(this.sourceData);
		this.subscriptions.currentValueChange = this.timerService.getCurrentValueChange().subscribe(value=> this.currentTimerValue = value);
		setTimeout(()=>this.dataSubjectService.setsourceDataValue(this.sourceData));
	}


	ngOnInit(): void {
		this.timerService.setUpperBound( this.sourceData.length * this.timerPerValue);
    	this.currentTimerValue = this.sourceData.length * this.timerPerValue;
		this.onPlaying();
		document.addEventListener('keydown',this.processKeyDown.bind(this));
	}

	/**
	 * Clear the component used static data
	 */
	ngOnDestroy(){
		this.timerService.clear();
	   
		// Unsubscribe from all registered subscriptions
		Object.keys(this.subscriptions).forEach((key : string) => {
				this.subscriptions[key].unsubscribe();
		});
	}
	/**
	 * Processes the timer value changes.
	 * @param value : The current timer value
	 */
	processCurrentTimerValueChangee(value : number){
		this.currentTimerValue = value;
  	}

  	processFinalDataChange(value : Area[]){
		if(this.gameStatus!=GameStatus.PLAYING) return; // If not int game, then shall stop
		this.finalData = value;
		if(this.dataSubjectService.checkIfAllDataFound()){
            this.setGameStatus(GameStatus.WON);
        }
  	}

	/**
	 * Processes the current data changes. Make it usable to child components.
	 * @param value : An area
	 */
	private processCurrentDataChange(value:any): void{
		this.currentData=value;
	}
	/**
	 * Implements the behaviour for when the game is launched
	 */
	onPlaying(): void {
		this.timerService.startTimer(this.onLost.bind(this));
	}
	 /**
	 * Implements the behaviour for when the game is on pause
	 */
	onPause(): void {
		this.timerService.pauseTimer();
	}
	 /**
	 * Implements the behaviour for when the player won
	 */
	onWon(): void {
		this.gameStatusChange.emit(GameStatus.WON);
	}
	 /**
	 * Implements the behaviour for when the player lost
	 */
	onLost(): void {
		this.gameStatusChange.emit(GameStatus.LOST);
	}

	/**
	 * TO REMOVE
	 * @param ev FOR GOD SAKE REMOVE ME PLEASE 
	 * @deprecated REMOVE | FOR TEST PURPOSE
	 */
	processKeyDown(ev: KeyboardEvent){
		if(ev.key == "1") this.setGameStatus(GameStatus.LOST)
		if(ev.key == "2") this.setGameStatus(GameStatus.WON)
	}

	/**
	 * Set the game status to its new value, then launch processing of the new value, before emitting the value to parent component (that may, or not, change the scene)
	 * @param gameStatus A `GameStatus` value
	 */
	setGameStatus(gameStatus : GameStatus){
		this.gameStatus = gameStatus;
		this.processGameStatusChange(this.gameStatus);
		this.gameStatusChange.emit(gameStatus);
	}

	/**
	 * Processes game status changes
	 * @param gameStatus A `GameStatus` value
	 */
	private processGameStatusChange(gameStatus : GameStatus){
		switch(gameStatus){
		  case GameStatus.PLAYING :
			this.onPlaying();
			break;
		  case GameStatus.PAUSE :
			this.onPause();
			break;
		  case GameStatus.WON :
			this.onWon();
			break;
		  case GameStatus.LOST :
			this.onLost();
			break;
		}
	  }
}
