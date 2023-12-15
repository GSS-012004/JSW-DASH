import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit,ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr'
import { NgbCarouselConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Moment } from 'moment';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import dayjs from 'dayjs/esm';
import { FireandsmokeService } from './fireandsmoke.service';
import { Lightbox, LightboxConfig } from 'ngx-lightbox';

export interface violation {
  si_no?: string
}
var data: any[] = [];


@Component({
  selector: 'app-fire-and-smoke-violation',
  templateUrl: './fire-and-smoke-violation.component.html',
  styleUrls: ['./fire-and-smoke-violation.component.css']
})

export class FireAndSmokeViolationComponent implements OnInit, OnDestroy, AfterViewInit {
  cameraDetails: any[] = [];
  imageData: any[] = []
  tempdata: any[] = [];
  Edata: any[] = []
  Images: any[] = []
  violdata: any[] = [];
  violationsList: any[] = []
  selectedCameraId: string | null = null
  selectedViolType: string | null = null
  alertmessage: string = ''
  dataFetchStatus: string = 'init'
  selectedItems: any
  API: any;
  interval: any
  dropdownSettings2: any
  selectedViolation!: any
  currentViol!: any
  editViol: any
  violLength: number = 0
  page: number = 1
  pageSize: number = 30
  delay: number
  ExcelRange: number
  relayDelay: number
  hooterDelay: number
  isdatewise: boolean = false;
  isActive: boolean
  latest: boolean = false
  isLatest: boolean = false
  isdate: boolean = false
  isalert: boolean = false
  excelLoad: boolean = false
  isExcel: boolean = false
  excelLoader: boolean = false
  loading: boolean = false
  alert: boolean = true
  audioOff: boolean = false
  loader2: boolean = false
  Excel: boolean = false
  loaderLatest: boolean = false
  isEditTable: boolean = true
  dropdownList: Observable<any[]> = of([])
  total: Observable<number> = of(0)
  violData: Observable<any[]> = of([])
  violationTypeList: Observable<any[]> = of([{ key: '0', label: 'All Violations', icon: 'pi', data: 'all_violations' }])
  fromDateControl: FormControl = new FormControl(new Date().getTime(), Validators.required)
  toDateControl: FormControl = new FormControl(new Date(), Validators.required)
  excelToDate: FormControl = new FormControl(new Date(), Validators.required)
  excelFromDate: FormControl = new FormControl(new Date(), Validators.required)

  dropdownSettings!: IDropdownSettings
  fromDate: any = new Date()
  toDate: any = new Date()
  selectedMoments: { startDate: Moment, endDate: Moment } = null
  Subsciption!: Subscription
  objectKeys = Object.keys
  @ViewChild('dangerAlert') Violation: ElementRef<any>;
  @ViewChildren(DaterangepickerDirective) pickerDirective: any;

 ranges: any = {
    'Today': [dayjs().hour(0).minute(0).second(0), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days').hour(0).minute(0).second(0), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days').hour(0).minute(0).second(0), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days').hour(0).minute(0).second(0), dayjs()],
    'This Month': [dayjs().startOf('month').hour(0).minute(0).second(0), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month').hour(0).minute(0).second(0), dayjs().subtract(1, 'month').endOf('month')]
  }
 
  
  constructor(
    private http: HttpClient,
    private webServer: FireandsmokeService,
    private datepipe: DatePipe,
    private toasterService: ToastrService,
    private snackbar: MatSnackBar,
    public modalService: NgbModal,
    public Router: Router,
    public ngbCarousal: NgbCarouselConfig,
    private _lightbox: Lightbox,
    private _lightBoxConfig: LightboxConfig,) 
    {
        this.API = webServer.IP
        this.ExcelRange = 0
        this.webServer.CheckApplicationStatus().subscribe((response: any) => {
          console.log(response)
          if (response.success) {
            localStorage.setItem('appStatus', response.message[0].process_status)
            var process = response.message.find((el: any) => {
              return el.process_name == 'fire_smoke_app' ? el : ''
            })
            this.isActive = process.process_status
          }
        })


        localStorage.getItem('audioOff') == 'true' ? this.audioOff = true : this.audioOff = false
        localStorage.getItem('alert') == 'true' ? this.alert = true : this.alert = false
        console.log(localStorage.getItem('audioOff'), localStorage.getItem('alert'))
        this.delay = this.webServer.logInterval
        console.log(this.relayDelay)
        this.hooterDelay = this.webServer.delay
        this.getCameraList()
        this.getViolationTypes()
        this.ngbCarousal.showNavigationArrows = true
        this.ngbCarousal.showNavigationIndicators = true
        this.ngbCarousal.interval = 50000000
   
    }


  openDatePicker(event: any) {
    var dateInput = document.getElementById('dateInput')
    dateInput.click()
  }

  onCameraIdSelect(event: any) {
    this.isdatewise ? this.page = 1 : ''
    this.selectedCameraId = this.selectedItems.data
    console.log(this.selectedItems)
    console.log(event)
  }

  ngOnDestroy() {
    this.modalService.dismissAll()
    clearInterval(this.interval)
    this.isalert = false
     this.toasterService.clear()
  }


  getCameraList() {
    var cameralist: any[] = []
    var cameraIdList: any[] = []
    cameralist[0] = { key: '0', label: 'All Cameras', data: 'all_cameras' }

    this.webServer.GetCameraDetails().subscribe((data: any) => {
      if (data.success === true){
        data.message.forEach((el: any, i: number) => {
          cameraIdList.push({ cameraid: i, cameraname: el })
        });
        cameraIdList = cameraIdList.filter((el, i, a) => i === a.indexOf(el))
        cameraIdList.forEach((element: any, i: number) => {
          var obj;
          obj = { key: ((i + 1).toString()), label: element.cameraname, data: element.cameraname }
          cameralist.push(obj)
        })
        this.dropdownList = of(cameralist)
      }
    })
  }


  ngOnInit(): void {
    var fromDate = this.webServer.dateTransform(new Date()) + ' ' + '00:00:00'
    var toDate = this.webServer.dateTransform(new Date()) + ' ' + '23:59:59'
    this.fromDateControl.setValue(fromDate)
    this.toDateControl.setValue(toDate)

    this.dropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      itemsShowLimit: 1,
      allowSearchFilter: true,
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
      this.webServer.GetFiresmokeLiveViolation().subscribe((Rdata: any) => {
        if (Rdata.success) {
          table?.classList.remove('loading')
          var data = Rdata.message
          this.imageData = Rdata.message
          this.tempdata = Rdata.message
          Number(localStorage.setItem("updatedLen", Rdata.message.length ? Rdata.message.length : 0))
          this.tempdata = Rdata.message
          this.total = of(this.tempdata.length)
          this.violData = of(Rdata.message)
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

  sliceVD(){
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
      cameraname: this.selectedItems ? this.selectedItems.data : 'none',
    }
    console.log(body)
    let dataLength: number = await this.GetViolationLength(body.from_date, body.to_date, body.cameraname != 'none' ? body.cameraname : null)
   
      this.webServer.CreateViolationExcel(body).subscribe((Response: any) => {
        if (Response.success) {
            this.Edata = Response.message
            this.Edata = Response.message
            this.webServer.DownloadViolationExcel().subscribe((response: HttpResponse<any>) => {
              this.excelLoader = false
              this.excelLoad = false
              this.isExcel = true
              var contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              const blob = new Blob([response.body], { type: '.xlsx' });
              var fileName = "violation report" + " " + this.datepipe.transform(new Date, 'YYYY_MM_dd_h_mm_ss') + '.xlsx'
              const file = new File([blob], fileName, { type: '.xlsx' });
              saveAs(blob, fileName);
            },
            err => {
              this.excelLoader = false
              this.excelLoad = false
              this.isExcel = true
              this.excelLoader = false
              this.webServer.notification("Error while downloading excel sheet",'Retry')
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

     
  

  //-------METHOD TO DOWNLOAD THE EXCEL--------
  GetViolationLength(fromDate: any, toDate: any, cameraName: any, violationType?: any) {
    this.excelLoader = true
    var length
    this.webServer.DatewiseViolations(fromDate, toDate, null, null, cameraName ? cameraName : null, violationType ? violationType : null).subscribe((Response: any) => {
      if (Response.success) {
        length = Response.message.length
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
    },
     err => {
      this.loading = false
    })

    //------------INTERWAL TO FETCH THE VIOLATIONS -------------
    
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

  ngAfterViewInit() {
    this.dataread()
  }

  public dataread() {
    this.interval = setInterval(() => {
      if (!this.isdate) {
        if (Number(localStorage.getItem("updatedLen"))) {
          this.violLength = Number(localStorage.getItem("updatedLen"))
        }
        this.Subsciption = this.webServer.GetFiresmokeLiveViolation().subscribe((Rdata: any) => {
          this.dataFetchStatus = 'success'

          if (Rdata.success) {
            var response = { ...Rdata }
            var cviol = [...Rdata.message]
            localStorage.setItem("updatedLen", JSON.stringify(cviol.length))
            var updatedLen = Number(localStorage.getItem("updatedLen"))
            if ((response.now_live_count - response.previous_live_count) > 0) {
              var diff = response.now_live_count - response.previous_live_count;
              if (this.alert) {
                for (let i = diff - 1; i >= 0; i--) {
                  if (this.alert) {
                    setTimeout(() => {
                      this.currentViol = cviol[i]
                      this.showViol()
                    }, 300);
                    !this.audioOff ? this.alertSound() : ''
                  }
                }
              }
              this.tempdata = Rdata.message
              this.total = of(this.tempdata.length)
              this.violData = of(Rdata.message)
              this.sliceVD()
            }
          }
        }, 
        Err => {
          this.dataFetchStatus = 'Error'
        }
        )
      }
    }, 
    this.delay)
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
    this.isdate = false
    this.tempdata = []
    this.total = of(0)
    this.Images = []
    var table = document.getElementById('dataTable')
    table?.classList.add('loading')
    this.loader2 = true
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


  downloadVideo(video: any) {
    const videoUrl = video;
    const requestOptions = {
      headers: new HttpHeaders({
        responseType: 'blob',
      }),
      withCredentials: true
    };
    const videoName = videoUrl.substr(videoUrl.lastIndexOf('/') + 1);
    this.http.get(videoUrl, { responseType: 'blob' }).subscribe((d: any) => {
      saveAs(d, videoName);
    },
      (err: any) => {
      }
    )
  }


  ResetFilters() {
    this.selectedMoments = null
    this.selectedItems = null
    this.isdatewise = false
    this.dataread()
  }


  IsDeleteData(modal: any, violationData: any) {
    this.selectedViolation = violationData
    this.modalService.open(modal)
  }


  VerifyFalseViol(event: any, viol: any) {
    this.editViol = viol
    this.webServer.VerifyViolation(this.editViol._id.$oid, false).subscribe((response: any) => {
      this.webServer.notification(response.message)
      if (response.success) {
        this.modalService.dismissAll()
        if (this.isdatewise)
          this.Submit()
      }
      if (!this.isdatewise) {
        this.GetViolationData()
      }
    },
     (Err: any) => {
      this.webServer.notification("Error while the  Process", 'Retry')
    })
  }


  GetViolationData() {
    var table = document.getElementById('content')
    table?.classList.add('loading')
    if (!this.latest || this.isLatest) {
      this.webServer.GetFiresmokeLiveViolation().subscribe((Rdata: any) => {
        if (Rdata.success) {
          table?.classList.remove('loading')
          var data = Rdata.message
          this.imageData = Rdata.message
          this.tempdata = Rdata.message
          Number(localStorage.setItem("updatedLen", Rdata.message.length ? Rdata.message.length : 0))
          this.tempdata = Rdata.message
          this.total = of(this.tempdata.length)
          this.violData = of(Rdata.message)
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


  VerifyTrueViol(event: any, viol: any) {
    this.editViol = viol
    this.webServer.VerifyViolation(this.editViol._id.$oid, true).subscribe((response: any) => {
      this.webServer.notification(response.message)
      if (response.success) {
        this.modalService.dismissAll()
        if (this.isdatewise)
          this.Submit()
      }
      if (!this.isdatewise) {
        this.GetViolationData()
      }
    }, 
    (Err: any) => {
      this.webServer.notification("Error while the  Process", 'Retry')
    })
  }


  DeleteViolationData() {
    this.webServer.DeleteViolationData(this.selectedViolation._id.$oid).subscribe((response: any) => {
      if (response.success) {
        this.modalService.dismissAll()
        this.webServer.notification(response.message)
        this.RefreshViolationData()
      } else {
        this.modalService.dismissAll()
        this.webServer.notification(response.message, 'Retry')
      }
    },
      Err => {
        this.webServer.notification('Error while the process', 'Retry')
      })
  }



  RefreshViolationData() {
    if (!this.isdatewise && !this.isLatest) {
      var table = document.getElementById('dataTable')
      table?.classList.add('loading')
      this.webServer.GetFiresmokeLiveViolation().subscribe((Response: any) => {
        if (!this.latest) {
          table.classList.remove('loading')
          if (Response.success === true) {
            this.imageData = Response.message
            this.tempdata = Response.message
            this.total = of(this.violdata.length)
            this.violData = of(Response.message)
            data = Response.message
            this.sliceVD()
            var data = Response.message
            this.violdata = Response.message
            if (this.tempdata.length > 0) {
              this.Excel = true
            }
            else {
            }
            this.sliceVD()
          }
          else {

          }
        }
      }, 
      (err: any) => {
        table.classList.remove('loading')
        console.log(err)
      })
    }

    else if (this.isdatewise && !this.isLatest) {
      var table = document.getElementById('dataTable')
      table?.classList.add('loading')
      this.pageSize = 30
      this.page = 1
      this.webServer.DatewiseFiresmokeViolations(this.fromDate, this.toDate, null, null, this.selectedCameraId ? this.selectedCameraId : null, this.selectedViolType ? this.selectedViolType : null).subscribe((Response: any) => {
        this.dataFetchStatus = 'success'
        if (Response.success) {
          if (Response.message.length == 0) {
            this.tempdata = []
            this.violData = of([])
            this.total = of(0)
            table?.classList.remove('loading')
            this.notification("No violations found for entered date and time")
          }
          if (Response.message.length > 0) {
            this.imageData = Response.message
            this.total = of(Response.message.length)
            this.webServer.DatewiseFiresmokeViolations(this.fromDate, this.toDate, this.page, this.pageSize, this.selectedCameraId ? this.selectedCameraId : null, this.selectedViolType ? this.selectedViolType : null).subscribe((Response: any) => {
              if (Response.success) {
                table?.classList.remove('loading')
                if (Response.message.length === 0) {
                  this.notification("No violations found")
                  this.violData = of([])
                }
                else {
                  this.tempdata = Response.message              
                  this.violData = of(this.tempdata)
                  this.sliceVD()
                }
              }
            },
              err => {
                this.dataFetchStatus = 'Error'
                this.notification("Error while fetching the data")
              })
          }
        }
        else {
          this.tempdata = []
          this.violData = of([])
          this.total = of(0)
          table?.classList.remove('loading')
          table?.classList.remove('loading')
          this.notification("No violations found")
        }
      }, 
      err => {
      })
    }
    else if (this.isLatest || this.latest) {
      this.getLatestData()
    }
  }


  imageCarousal(viol: any) {
    this.Images = [];
    if(Array.isArray(viol)) {
      viol.forEach((imgname: string, index: number) => {
      this.Images[index] = {
        src: this.API + '/GETFIRESMOKEIMAGE/' + imgname,
        thumb: this.API + '/GETFIRESMOKEIMAGE/' + imgname,
        caption: imgname,
      };
    });
    }
    else if (typeof viol === 'string') {
      // If viol.riro_image.After is a string, assume it's a single image
      this.Images[0] = {
        src: this.API + '/GETFIRESMOKEIMAGE/' + viol,
        thumb: this.API + '/GETFIRESMOKEIMAGE/' + viol,
        caption: viol,
      };
    } 
    else{
      console.error('Invalid format for viol.riro_image.After');
      // Handle other cases or throw an error if needed
      return;
    }
  
    this.open(0);
  }
  open(index: number): void {
    this._lightbox.open(this.Images, index);
  }
  close(): void {
    this._lightbox.close();
  }

}