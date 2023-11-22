

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { ToastrModule } from "ngx-toastr";
import { alertComponent } from "src/app/common/alert.component";
import { CommonModules } from "src/app/common/common.module";
import { FireAndSmokeViolationComponent } from './fire-and-smoke-violation.component';
import { TreeSelectModule } from 'primeng/treeselect';
import { FireandsmokeService } from './fireandsmoke.service';


const routes:Routes=[{path:'',component:FireAndSmokeViolationComponent}]

@NgModule({
  declarations: [FireAndSmokeViolationComponent],
  imports: [
    CommonModules,
    TreeSelectModule,
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

     providers:[FireandsmokeService],

  exports:[RouterModule]

})
export class FireAndSmokeViolationModule { }