import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about.component';
import { RouterModule, Routes } from '@angular/router';

import { TabViewModule } from "primeng/tabview";

const routes:Routes=[{path:'',component:AboutComponent}]

@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
    ,TabViewModule

  ],
  exports:[RouterModule]
})
export class AboutModule { }