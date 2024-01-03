// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { SpillageViolationComponent } from './spillage-violation.component';
// import { Routes } from '@angular/router';

// const routes:Routes=[{path:'',component:SpillageViolationComponent}]

// @NgModule({
//   declarations: [SpillageViolationComponent],
//   imports: [
//     CommonModule,
    
//   ]
// })
// export class SpillageViolationModule { }


// import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FaIconLibrary } from "@fortawesome/angular-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { NgbCarouselModule, NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { LightboxModule } from "ngx-lightbox";
import { ToastrModule } from "ngx-toastr";
import { alertComponent } from "src/app/common/alert.component";
import { CommonModules } from "src/app/common/common.module";
import { ServerService } from "src/app/Services/server.service";

// import { TreeSelectModule } from 'primeng/treeselect';
// import { FireAndSmokeViolationComponent } from './fire-and-smoke-violation.component';
import { Tree } from 'primeng/tree';
import { TreeSelectModule } from 'primeng/treeselect';
// import { FireandsmokeService } from './fireandsmoke.service';
import { SpillageViolationComponent } from './spillage-violation.component';
import { SpillageViolationService } from './spillage-violation.service';
import { CarouselModule } from 'primeng/carousel';


const routes:Routes=[{path:'',component:SpillageViolationComponent}]
// var CanvasJSChart = CanvasJSAngularChart.CanvasJSChart;

@NgModule({
  declarations: [SpillageViolationComponent],
  imports: [
    CommonModules,
    TreeSelectModule,
    CarouselModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxDaterangepickerMd.forRoot({}),
    RouterModule.forChild(routes),
    ToastrModule.forRoot({
      timeOut: 5000,
      toastComponent: alertComponent,
      progressBar: true,
      newestOnTop: true,
    }),

    ],

     providers:[SpillageViolationService],
    // entryComponents:[alertComponent],

  exports:[RouterModule]

})
export class SpillageViolationModule { }