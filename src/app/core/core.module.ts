import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';

import { MapsGamesModule } from 'src/app/shared/components/maps-games/maps-games.module';
import { MapsModule } from 'src/app/shared/components/maps/maps.module';
import { LogoModule } from '../shared/assets/logo/logo.module';

import { MapPageComponent } from './map-page/map-page.component';

// Shared components
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
const shared_components : any[] = [
  HeaderComponent,
  FooterComponent
];
@NgModule({
  declarations: [
    MapPageComponent,
    ...shared_components
  ],
  imports: [
    CommonModule,
    MapsGamesModule,
    MapsModule,
    MaterialModule,
    LogoModule,
    RouterModule
  ] ,
  exports:[
    shared_components
  ]
})
export class CoreModule { }
