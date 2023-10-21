import { DatePipe, Time } from '@angular/common';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, Query, ViewChild, ViewChildren } from '@angular/core';
import { ServerService } from 'src/app/Services/server.service';
import { Lightbox, LightboxConfig } from 'ngx-lightbox'
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of, startWith, Subscriber, Subscription, switchMap } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr'
import { ModalDismissReasons, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Moment } from 'moment';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import dayjs from 'dayjs/esm';

export interface violation {
  si_no?: string
}
var data: any[] = [];


@Component({
  selector: 'app-fire-and-smoke-violation',
  templateUrl: './fire-and-smoke-violation.component.html',
  styleUrls: ['./fire-and-smoke-violation.component.css']
})

export class FireAndSmokeViolationComponent
 {

    selectedCameraId: string | null = null
    selectedItems: any
    isdatewise: boolean = false;
    page: number = 1
    // selected : {start:any, end:any } ;
    API: any ;
    cameraDetails: any[] = [];
    data: any[] = []
    dropdownList: Observable<any[]> = of([])

    ranges: any = {
    'Today': [dayjs().hour(0).minute(0).second(0), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days').hour(0).minute(0).second(0), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days').hour(0).minute(0).second(0), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days').hour(0).minute(0).second(0), dayjs()],
    'This Month': [dayjs().startOf('month').hour(0).minute(0).second(0), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month').hour(0).minute(0).second(0), dayjs().subtract(1, 'month').endOf('month')]
   }

    fromDateControl: FormControl = new FormControl(new Date().getTime(), Validators.required)
    toDateControl: FormControl = new FormControl(new Date(), Validators.required)
    dropdownSettings!: IDropdownSettings
    dropdownSettings2: any
    violLength: number = 0
    latest: boolean = false
    isLatest: boolean = false
    imageData: any[] = []
    tempdata: any[] = [];
    total: Observable<number> = of(0)
    violData: Observable<any[]> = of([])

    isdate: boolean = false
    pageSize: number = 30
    selectedViolType: string | null = null
    fromDate: any = new Date()
    toDate: any = new Date()

    isalert: boolean = false
    excelLoad: boolean = false
    isExcel: boolean = false
    selectedViolation!: any
    selectedMoments: { startDate: Moment, endDate: Moment } = { startDate:null,endDate:null};
    excelFromDate: FormControl = new FormControl(new Date(), Validators.required)
    excelToDate: FormControl = new FormControl(new Date(), Validators.required)
    ExcelRange: number
    Edata: any[] = []
    excelLoader: boolean = false
    alertmessage: string = ''
    loc2: FormControl = new FormControl('', Validators.required)

    loading: boolean = false
    images: any[] = []
    interval2: any
    Images: any[] = []
    Subsciption!: Subscription
    violdata: any[] = [];
    alert: boolean = true
    currentViol!: any

    audioOff: boolean = false


    violationTypeList: Observable<any[]> = of([{ key: '0', label: 'All Violations', icon: 'pi', data: 'all_violations' }])
    interval: any
    loader2: boolean = false
    Excel: boolean = false
    delay: number
    violationsList: any[] = []
    objectKeys = Object.keys
    @ViewChild('dangerAlert') Violation: ElementRef<any>;
    @ViewChildren(DaterangepickerDirective) pickerDirective: any;
    editViol: any

    relayDelay: number
    hooterDelay: number

    loaderLatest: boolean = false

    currentDate:Date;
    currentTime:Date;



    constructor(private http: HttpClient,
      private webServer: ServerService,
      private datepipe: DatePipe,
      private toasterService: ToastrService,
      private _lightbox: Lightbox,
      private _lightBoxConfig: LightboxConfig,
      private router: Router,
      private snackbar: MatSnackBar,
      public modalService: NgbModal,)
     {
      // this.API = webServer.IP
       this.ExcelRange = 0



      localStorage.getItem('audioOff') == 'true' ? this.audioOff = true : this.audioOff = false
      localStorage.getItem('alert') == 'true' ? this.alert = true : this.alert = false
      console.log(localStorage.getItem('audioOff'), localStorage.getItem('alert'))
      this.delay = this.webServer.logInterval
      console.log(this.relayDelay)
      this.hooterDelay = this.webServer.delay
      this.getCameraList()
      this.getViolationTypes()
     }

    // selectedMoments: { startDate: Moment, endDate: Moment } = { startDate:null,endDate:null};

    // @ViewChildren(DaterangepickerDirective) pickerDirective: any;
    // editViol: any
    // dropdownList: Observable<unknown>|Subscribable<unknown>|Promise<unknown>;

    openDatePicker(event: any){
      var dateInput = document.getElementById('dateInput')
      dateInput.click()
    }

   onCameraIdSelect(event: any) {
    this.isdatewise ? this.page = 1 : ''
    this.selectedCameraId =  this.selectedItems.data
    console.log(this.selectedItems)
    console.log(event)
    }

    //   ngOnDestroy() {
    //     this.modalService.dismissAll()
    //     clearInterval(this.interval)
    //     clearInterval(this.interval2)
    //     this.isalert = false

    //     this.toasterService.clear()

    //   }
//   getCameraList() {
//     var cameralist: any[] = []
//     var cameraIdList: any[] = []

//     cameralist[0] = { key: '0', label: 'All Cameras', data: 'all_cameras' }


//   this.webServer.GetCameraNames().subscribe((data: any) => {
//     console.log(data)
//     if (data.success === true) {

//       data.message.forEach((el: any, i: number) => { this.cameraDetails[i] = { camera_id: el.camera_id, camera_name: el.camera_name } })
//       console.log(this.cameraDetails)

//     }
//     else {

//     }
//   })

// }

  getCameraList() {
  var cameralist: any[] = []
  var cameraIdList: any[] = []

  cameralist[0] = { key: '0', label: 'All Cameras', data: 'all_cameras' }
  this.webServer.GetCameraDetails().subscribe((data: any) => {
    if (data.success === true) {
      data.message.forEach((el: any, i: number) => {
        cameraIdList.push({ cameraid: i, cameraname: el })
      });
      cameraIdList = cameraIdList.filter((el, i, a) => i === a.indexOf(el))
      cameraIdList.forEach((element: any, i: number) => {
        // cameralist[i + 1] = { item_id: element.cameraid, item_text: element.cameraname }
        var obj;
        obj = { key: ((i + 1).toString()), label: element.cameraname, data: element.cameraname }

        cameralist.push(obj)
      });


      this.dropdownList = of(cameralist)
    }

  })

}





ngOnInit(): void {
  this.getCameraList();
  this.currentDate = new Date();
  setInterval(() => {
    this.currentTime = new Date();
  }, 1000);
  // this.currentTime = new Time();
//  this. getViolationTypes();

  var fromDate = this.webServer.dateTransform(new Date()) + ' ' + '00:00:00'
  var toDate = this.webServer.dateTransform(new Date()) + ' ' + '23:59:59'
  this.fromDateControl.setValue(fromDate)
  this.toDateControl.setValue(toDate)

  this.dropdownSettings = {
    singleSelection: true,
    idField: 'item_id',
    textField: 'item_text',
    // selectAllText: 'Select All',
    // unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    // closeDropDownOnSelection: true,
    // noDataAvailablePlaceholderText: 'No cameras detected',
    // maxHeight: 197
  };








  this.dropdownSettings2 = {
    singleSelection: true,
    idField: 'item_id',
    textField: 'item_text',

    itemsShowLimit: 1,
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
    noDataAvailablePlaceholderText: 'No violation types detected',
    maxHeight: 197
  };






  //...........Reading previous violation data's length from local storage....
  this.violLength = Number(localStorage.getItem("updatedLen"))



  //------------Reading the camera details--------------
  //uncomment while you work
  this.webServer.GetCameraNames().subscribe((data: any) => {
    console.log(data)
    if (data.success === true) {

      data.message.forEach((el: any, i: number) => { this.cameraDetails[i] = { camera_id: el.camera_id, camera_name: el.camera_name } })
      console.log(this.cameraDetails)

    }
    else {

    }
  })
  var table = document.getElementById('dataTable')
  table?.classList.add('loading')


  if (!this.latest || this.isLatest) {
    this.webServer.LiveViolationData().subscribe((Rdata: any) => {
      if (Rdata.success) {

        table?.classList.remove('loading')

        var data = Rdata.message

        this.imageData = Rdata.message
        this.tempdata = Rdata.message
        Number(localStorage.setItem("updatedLen", Rdata.message.length ? Rdata.message.length : 0))
        this.tempdata = Rdata.message
        this.total = of(this.tempdata.length)
        this.violData = of(Rdata.message)
        // console.log(this.violData)
        this.sliceVD()
      }
      else {
        table?.classList.remove('loading')
        this.notification(Rdata.message)
      }
    },
      err => {
        table?.classList.remove('loading')

        this.notification("Error While fetching the data")
      })


  }



}
notification(message: string, action?: string) {
  this.snackbar.open(message, action ? action : '', ({
    duration: 4000, panelClass: ['error'],
    horizontalPosition: 'end',
    verticalPosition: 'bottom',
  })
  )
}

sliceVD() {


  if (!this.isdate) {
    this.total = of((this.tempdata.slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)).length)
    this.total = of(this.tempdata.length)
    this.violData = of((this.tempdata.map((div: any, SINo: number) => ({ SNo: SINo + 1, ...div })).slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)))
  }
  if (this.isdate) {
    var table = document.getElementById('dataTable')
    table?.classList.add('loading')
    this.webServer.DatewiseViolations(this.fromDate, this.toDate, this.page, this.pageSize, this.selectedCameraId ? this.selectedCameraId : null, this.selectedViolType ? this.selectedViolType : null).subscribe((Response: any) => {
      if (Response.success) {
        table?.classList.remove('loading')
        if (Response.message.length === 0) {
          this.notification("No violations found")
        }
        data = Response.message
        this.tempdata = data
        //this.imageData=
        this.violData = of(this.tempdata)

      }
    })

  }

}






async submitForm() {
  this.isalert = false
  this.excelLoad = true
  this.isExcel = false


   this.selectedViolType = this.selectedViolation ? <any>this.selectedViolation.data : null


  this.selectedCameraId = this.selectedItems ? this.selectedItems.data : null

  var body = {
    from_date: this.selectedMoments.startDate.format('YYYY-MM-DD HH:mm:ss'),
    to_date: this.selectedMoments.endDate.format('YYYY-MM-DD HH:mm:ss'),
    cameraname: this.selectedCameraId ? this.selectedCameraId : 'none',
    violation_type: this.selectedViolType ? this.selectedViolType : 'none'
  }

  let dataLength:number=await this.GetViolationLength(body.from_date,body.to_date,body.cameraname!='none'?body.cameraname:null,body.violation_type!='none'?body.violation_type:null)
  if(dataLength>100){
    alert("huge Amount of Data found")
  }
  else{
  var date1 = new Date(this.excelFromDate.value)
  var date2 = new Date(this.excelToDate.value)
  var Difference_In_Time = date2.getTime() - date1.getTime();
  const diffInDs = (Difference_In_Time) / (1000 * 3600 * 24)

  if (diffInDs <= this.ExcelRange) {

    this.webServer.CreateViolationExcel(body).subscribe((Response: any) => {
      if (Response.success) {
        this.excelLoad = false
        this.isExcel = true

        this.Edata = Response.message
        this.Edata = Response.message
        this.webServer.DownloadViolationExcel().subscribe(
          (response: HttpResponse<any>) => {
            this.excelLoader = false
            this.excelLoad = false
            var contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

            const blob = new Blob([response.body], { type: '.xlsx' });
            // var fileName =  response.headers.get('Content-Disposition').split(';')[1];
            var fileName = "violation report" + " " + this.datepipe.transform(new Date, 'YYYY_MM_dd_h_mm_ss') + '.xlsx'
            const file = new File([blob], fileName, { type: '.xlsx' });
            saveAs(blob, fileName);
          },
          err => {
            this.excelLoader = false
          })
      }
      else {
        this.notification(Response.message, 'Retry')
        this.excelLoad = false
        this.isExcel = false
        this.alertmessage = Response.message
        this.isalert = true

      }
    },
      err => {
        this.excelLoad = false

        this.isExcel = false
        this.alertmessage = "Error while creating excel"
        this.notification(this.alertmessage, 'Retry')
        this.isalert = true
      })
  }

  else {
    this.excelLoad = false
    this.isalert = true
    this.excelLoader = false
    this.alertmessage = "Data range should be " + this.ExcelRange + " days"
    this.webServer.notification(this.alertmessage)
  }
  var formData: FormData = new FormData()

  formData.append('location', this.loc2.value)
}
}

//-------METHOD TO DOWNLOAD THE EXCEL--------
 GetViolationLength(fromDate:any,toDate:any,cameraName:any,violationType:any) {
  this.excelLoader = true
  var length
  this.webServer.DatewiseViolations(fromDate, toDate, null, null, cameraName?cameraName:null,violationType?violationType:null).subscribe((Response: any) => {
    if (Response.success) {

     length= Response.message.length
    }
  })
  return length;
}






Submit() {
  this.isLatest = false
  this.selectedViolType = this.selectedViolation ? <any>this.selectedViolation.data : null
  this.selectedCameraId = this.selectedItems ? this.selectedItems.data : null
  this.Images = []
  this.fromDate = this.selectedMoments.startDate.format('YYYY-MM-DD HH:mm:ss')
  this.toDate = this.selectedMoments.endDate.format('YYYY-MM-DD HH:mm:ss')
  this.Subsciption ? this.Subsciption.unsubscribe() : ''
  // this.table.nativeElement.querySelectorAll('table.table.table-striped.table-bordered')
  var table = document.getElementById('dataTable')
  table?.classList.add('loading')

  this.pageSize = 30
  this.page = 1
  this.isdate = true
  this.loading = true
  this.webServer.DatewiseViolations(this.fromDate, this.toDate, null, null, this.selectedCameraId ? this.selectedCameraId : null, this.selectedViolType ? this.selectedViolType : null).subscribe((Response: any) => {
    if (Response.success) {
      if (Response.message.length == 0) {
        this.tempdata = []
        this.violData = of([])
        this.loading = false
        this.isdatewise = true
        this.total = of(0)
        table?.classList.remove('loading')
        this.notification("No violations found for entered date and time")
      }
      if (Response.message.length > 0) {
        this.imageData = Response.message
        this.total = of(Response.message.length)
        this.webServer.DatewiseViolations(this.fromDate, this.toDate, this.page, this.pageSize, this.selectedCameraId ? this.selectedCameraId : null, this.selectedViolType ? this.selectedViolType : null).subscribe((Response: any) => {
          if (Response.success) {
            this.loading = false
            table?.classList.remove('loading')
            // console.log(Response.message)
            if (Response.message.length === 0) {
              this.notification("No violations found")
              this.violData = of([])
              this.isdatewise = true
              this.loading = false

            }

            else {

              data = Response.message
              this.tempdata = Response.message
              this.isdatewise = true
              //this.imageCarousal()
              // console.log(this.tempdata)

              this.violData = of(this.tempdata)
              this.sliceVD()

              this.loading = false

            }
          }


          this.loading = false

        },
          err => {
            this.loading = false
            this.notification("Error while fetching the data")
          })
      }
    }
    else {
      this.tempdata = []
      this.violData = of([])
      this.loading = false
      this.isdatewise = true
      this.total = of(0)
      table?.classList.remove('loading')
      table?.classList.remove('loading')
      this.notification("No violations found")
      this.loading = false
    }



  }, err => {
    this.loading = false
  })





  //------------INTERWAL TO FETCH THE VIOLATIONS -------------
  this.interval2 = setInterval(() => {
    if (this.isdate) {
      if (Number(localStorage.getItem("updatedLen"))) {
        this.violLength = Number(localStorage.getItem("updatedLen"))
      }

      this.webServer.LiveViolationData().subscribe((Rdata: any) => {

        if (Rdata.success) {
          var cviol = Rdata.message
          var response = { ...Rdata }

          if (response.now_live_count - response.previous_live_count > 0) {
            this.violdata = Rdata.message
            //this.imageData = Rdata.message
            var diff = response.now_live_count - response.previous_live_count;
            //this.imageCarousal()

            if (this.alert) {
              for (let i = diff - 1; i >= 0; i--) {

                if (this.alert) {
                  this.currentViol = this.violdata[i]

                  setTimeout(() => {

                    this.showViol()
                    !this.audioOff ? this.alertSound() : ''
                  }, 300);

                }

              }
            }



          }

        }

      })
    }

  }, 3000)


}
  alertSound() {
    throw new Error('Method not implemented.');
  }



   //modal to view the image


  //MODAL FOR VIOLATION
  showViol() {
    this.toasterService.error(<any>this.Violation.nativeElement.innerHTML, " ", {
      enableHtml: true,
      positionClass: 'toast-top-right'
    })
    // console.log(currentViol)

  }

  onViolationTypeSelect(event: any) {
    console.log(this.selectedViolation)
    console.log(event)
    console.log(event.item_id)
    !this.isdatewise ? this.page = 1 : ''
    this.selectedViolType = this.selectedViolation.data
    console.log(this.selectedViolType)
    console.log(event)


  }

  // ngAfterViewInit() {
  //   this.dataread()


  // }

  public dataread() {

    this.interval = setInterval(() => {
      if (!this.isdate) {
        if (Number(localStorage.getItem("updatedLen"))) {
          this.violLength = Number(localStorage.getItem("updatedLen"))
        }
        this.Subsciption = this.webServer.LiveViolationData(this.selectedCameraId, this.selectedViolType).subscribe((Rdata: any) => {
          // console.log(Rdata)
          if (Rdata.success) {
            var response = { ...Rdata }
            var cviol = [...Rdata.message]
            console.log(this.isLatest)
            //console.log(Rdata.message)
            localStorage.setItem("updatedLen", JSON.stringify(cviol.length))
            var updatedLen = Number(localStorage.getItem("updatedLen"))
            console.log(updatedLen)

            console.log(this.violLength)
            if (response.now_live_count - response.previous_live_count > 0) {

              var diff = response.now_live_count - response.previous_live_count;

              if (this.alert) {
                for (let i = diff - 1; i >= 0; i--) {
                  var todayi = new Date()
                  var tempi = new Date(cviol[i].timestamp)

                  //hooter configaration

                  if (this.alert) {

                    this.currentViol = cviol[i]

                    setTimeout(() => {

                      this.showViol()

                    }, 300);
                    !this.audioOff ? this.alertSound() : ''
                  }

                }
              }

            }
          }
        }
        )
        if (!this.latest) {
          this.webServer.LiveViolationData().subscribe((Response: any) => {
            if (!this.latest) {
              if (Response.success === true) {
                console.log(Response)
                console.log(this.selectedCameraId)
                console.log(Response.message)

                this.imageData = Response.message
                this.tempdata = Response.message
                console.log(this.tempdata)
                //  this.imageCarousal()
                this.total = of(this.violdata.length)
                this.loader2 = false
                this.isdatewise = false

                this.violData = of(Response.message)

                data = Response.message
                this.sliceVD()
                var data = Response.message
                this.violdata = Response.message
                // this.tempdata = this.violdata

                if (this.tempdata.length > 0) {
                  this.Excel = true
                }
                else {
                  false
                }

                this.sliceVD()

              }
              else {

              }
            }
          }, (err: any) => {
            console.log(err)
          })
        }
      }
    }, this.delay)
  }



  //function to fetch the available violation types
  getViolationTypes() {
    var violTypeList: any[] = []
    var temp: any[] = []

    this.violationsList[0] = { key: '0', label: 'All Violations', data: 'all_violations' }
    this.webServer.GetViolationList().subscribe((reponse: any) => {
      if (reponse.success) {
        reponse.message.forEach((element: any) => {
          temp.push(element)
        });

        temp.forEach((element: any, index: number) => {
          var obj;

          obj = { key: (index + 1).toString(), icon: 'pi', label: element, data: element }

          this.violationsList.push(obj)
        })
        this.violationTypeList = of(this.violationsList)
      }
    })

  }




  //----------METHOD TO TOGGLE THE NOTIFICATION --------
  alertToggle() {
    this.alert = !this.alert
    localStorage.setItem('alert', this.alert ? 'true' : 'false')
    if (!this.alert) {
      this.audioOff = true
      localStorage.setItem('alert', 'false')

      localStorage.setItem('audioOff', 'true')
      this.toasterService.clear()
    }
  }


  //----------METHOD TO TOGGLE THE VOLUME-------
  volumeToggle() {
    if (!this.alert) {
      this.audioOff = true
      localStorage.setItem('audioOff', 'true')
    }
    else {
      this.audioOff = !this.audioOff
      localStorage.setItem('audioOff', this.audioOff ? 'true' : 'false')
    }
  }



  //-----------------METHOD TO GO BACK TO LIVE-------------------------

  BackToToday() {
    this.page = 1

    this.Images = []
    this.latest = false
    var table = document.getElementById('dataTable')
    table?.classList.add('loading')
    this.loader2 = true
    this.interval2 ? clearInterval(this.interval2) : ""
    this.isdate = false
    this.tempdata = []
    this.total = of(0)

    this.Images = []
    var table = document.getElementById('dataTable')
    table?.classList.add('loading')
    this.loader2 = true
    this.interval2 ? clearInterval(this.interval2) : ""
    this.isdate = false
    this.tempdata = []
    this.total = of(0)
    this.webServer.LiveViolationData().subscribe((Rdata: any) => {
      if (Rdata) {
        this.isLatest = false
        table?.classList.remove('loading')
        this.imageData = Rdata.message
        this.total = of(Rdata.message.length)
        if (!Rdata.success) {
          this.notification(Rdata.message)
        }
        var cviol = Rdata.message
        Rdata.success ? this.tempdata = Rdata.message : this.tempdata = []
        this.sliceVD()
        this.loader2 = true
        this.isdatewise = false
        localStorage.setItem("updatedLen", JSON.stringify(cviol.length))
        var updatedLen = Number(localStorage.getItem("updatedLen"))
      }

    })

    this.dataread()

  }



  //function to get the latest data
  getLatestData() {
    this.loader2 = false
    this.loaderLatest = true
    this.latest = true
    // this.interval2.subscribe()
    var table = document.getElementById('dataTable')
    table?.classList.add('loading')
    console.log(this.selectedViolType)
    this.webServer.LatestData(this.selectedViolType, this.selectedCameraId).subscribe((Rdata: any) => {
      if (Rdata.success) {
        this.isLatest = true
        table?.classList.remove('loading')
        this.loaderLatest = false
        data = Rdata.message
        Rdata.message.length === 0 ? this.notification("No violations found") : ''
        this.imageData = Rdata.message
        this.tempdata = Rdata.message
        console.log(this.tempdata)

        this.tempdata = Rdata.message


        this.total = of(Rdata.message.length)
        this.violData = of(Rdata.message)
        this.sliceVD()


      }
      else {
        this.loaderLatest = false
        table?.classList.remove('loading')
        this.notification("Error while fetching the data", 'Retry')
      }
    },
      err => {
        this.loaderLatest = false
        table?.classList.remove('loading')

        this.notification("Error While fetching the data", 'Retry')
      })


  }


  //----------------METHOD TO DOWNLOAD THE  IMAGE-------------

  // downloadImage(img: any) {
  //   const imgUrl = img;
  //   const requestOptions = {
  //     headers: new HttpHeaders({
  //       responseType: 'blob',
  //       // observe:'body'
  //     }),
  //     withCredentials: true
  //   };
  //   console.log(imgUrl)
  //   const imgName = imgUrl.substr(imgUrl.lastIndexOf('/') + 1);


  //   this.http.get(imgUrl, { responseType: 'blob' }).subscribe(
  //     (d: any) => {
  //       console.log("image url data", d);
  //       saveAs(d, imgName);

  //     },
  //     (err: any) => {
  //       console.log("error", err)
  //     }
  //   )

  // }

  downloadVideo() {
    const videoUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';

    fetch(videoUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'video.mp4'; // Specify the desired filename
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Error downloading video', error));
      console.log("video download is tirggerd")
  }


  // downloadVideo() {
  //   const videoUrl = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"

  //   fetch(videoUrl)
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //       return response.blob();
  //     })
  //     .then(blob => {
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = 'video.mp4'; // Specify the desired filename
  //       document.body.appendChild(a);
  //       a.click();
  //       window.URL.revokeObjectURL(url);
  //     })
  //     .catch(error => console.error('Error downloading video', error));
  // }


}