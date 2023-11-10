
import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders, HttpResponse, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, retry, Subject } from 'rxjs';
// import { configService } from './config';

@Injectable({
  providedIn: 'root'
})
export class FireandsmokeService {

  IP:string
  delay:number
  relayDelay:number
  dashboardInterval:number
  jobsheetInterval:number
  logInterval:number
  //isCollapse:Subject<boolean>=new Subject()
  constructor
  (public http:HttpClient,
    public   snackbar:MatSnackBar
,
    public datePipe:DatePipe) {
  var res=this.loadConfigFile('assets/config.json')
  console.log(res)
  res=JSON.parse(res)
  this.IP=res.IP
  console.log(this.IP)
  this.delay=res.hooterDelay
  this.relayDelay=res.relayDelay
  this.dashboardInterval=res.dashboardInterval
  this.jobsheetInterval=res.jobSheetStatusInterval
   this.logInterval=res.logInterval

  console.log(this.dashboardInterval)
  }



  GetCameraDetails(){
    return this.http.get(this.IP+ '/camera_details')
 }

 dateTransform(date:Date){
  return this.datePipe.transform(date,'yyyy-MM-dd HH:mm:ss')

}
GetCameraNames(){
  return this.http.get(this.IP+'/camera_details')
}

LiveViolationData (cameraName?:string | null,violType?:string|null,page?:number,size?:number) {

  // cameraName=cameraName? cameraName.replace(/ /g,'_'):null

  cameraName==="all_cameras"?cameraName=null:''
  violType==="all_violations"?violType=null:''
  //this.IP=<string>localStorage.getItem('changedIP')
  // return cameraId && !violType  ? this.httpClient.get(this.IP + "/jsw/live_data/cameraname/" + cameraId) :!cameraId && violType ? this.httpClient.get(this.IP + "/jsw/live_data/violation_type/"+violType):cameraId && violType? this.httpClient.get(this.IP + "/jsw/live_data/"+cameraId+'/'+violType):this.httpClient.get(this.IP + "/jsw/live_data")
  return    page && size && cameraName && violType? this.http.get(this.IP + '/live_data1/' + cameraName + '/'+violType+'/' + page + '/' + size): 
  !page && !size && cameraName && violType? this.http.get(this.IP + '/live_data1/' + cameraName + '/'+violType):
  page && size && cameraName && !violType ? this.http.get(this.IP + '/live_data1/cameraname/' + cameraName + '/' + page + '/' + size) : 
  !page && !size && !cameraName && violType ? this.http.get(this.IP + '/live_data1/violation/'+violType )
  : page && size && !cameraName && violType? this.http.get(this.IP + '/live_data1/violation/'+violType +'/'+ page + '/' + size) :
  page && size && (!cameraName) && (!violType) ? this.http.get(this.IP + '/live_data1/pagination/'+ page + '/' + size):
   !page && !size &&cameraName &&!violType? this.http.get(this.IP + '/live_data1/cameraname/'  + cameraName) :
   this.http.get(this.IP + '/live_data1')

}


DatewiseViolations(from: any, to: any, page?: number|null, size?: number|null, cameraName?: string | null,violType?:string|null) {
  var fromD = this.dateTransform(from)
  var toD = this.dateTransform(to)
  console.log(fromD, toD)
  console.log(page, size)
  // cameraName=cameraName? cameraName.replace(/ /g,'_'):null

  cameraName==="all_cameras"?cameraName=null:''
  violType==="all_violations"?violType=null:''
  var body;

 violType!==null?body={from_date:fromD,to_date:toD,violation_type:violType}: body={from_date:fromD,to_date:toD}
  console.log(violType)
  console.log(this.IP + '/datewise/' + cameraName + '/' + page + '/' + size)
  return    page && size && cameraName && violType? this.http.post(this.IP + '/datewise_violation/' + cameraName + '/' + page + '/' + size, body): 
  !page && !size && cameraName && violType? this.http.post(this.IP + '/datewise_violation/' + cameraName , body):
  page && size && cameraName ? this.http.post(this.IP + '/datewise/' + cameraName + '/' + page + '/' + size, body) : 
  !page && !size && !cameraName && violType ? this.http.post(this.IP + '/datewise_violation' , body)
  : page && size && !cameraName && violType? this.http.post(this.IP + '/datewise_violation/' + page + '/' + size, body) :
  page && size && (!cameraName) && (!violType) ? this.http.post(this.IP + '/datewise/'+ page + '/' + size , body):
   !page && !size &&cameraName &&!violType? this.http.post(this.IP + '/datewise/'  + cameraName, body) :
   this.http.post(this.IP + '/datewise', body)

}
CreateViolationExcel(data:any){
  return this.http.post(this.IP+'/create_violation_excel',data)
}
DownloadViolationExcel(){
  return this.http.get(this.IP+'/violation_excel_download',{observe:'response',responseType:'arraybuffer'})
}
notification(message: string, action?: string,duration?:number) {
  console.log('snackbar')
  this.snackbar.open(message, action ? action : '', ({
    duration:duration?duration:4000, panelClass: ['error'],
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
  })
  )
}

GetViolationList(){
  return this.http.get(this.IP+'/violation_type_details')
}

LatestData(violtype:any,cameraname:string){
  // return this.http.get(this.IP+'/latest_data')
  console.log(violtype,cameraname)
  return cameraname && !violtype?this.http.get(this.IP+'/latest_data_camera_name/'+cameraname):!cameraname && violtype?this.http.get(this.IP+'/latest_data_violation_type/'+violtype):cameraname && violtype?this.http.get(this.IP+'/latest_data/'+cameraname+'/'+ violtype):this.http.get(this.IP+'/latest_data_violation_type')

}

loadConfigFile(filepath:any){
  const JSON=this.readConfigFile(filepath,'application/json')
  return JSON



}

readConfigFile(filepath:any,mimeType:any){
  var xmlRequest=new XMLHttpRequest() 
  xmlRequest.open('GET',filepath,false)
  if (mimeType != null) {
   if (xmlRequest.overrideMimeType) {
       xmlRequest.overrideMimeType(mimeType);
   }
   xmlRequest.send()
   if(xmlRequest.status){
       return xmlRequest.response
   }
   else{
       return null
   }
 }
 
 }


 DeleteViolationData(id:any){
  return this.http.get(this.IP+'/Deleteviolation/'+id)
}

// GetViolationList(){
//   return this.http.get(this.IP+'/violation_type_details')
// }

GetRiRoViolationData(data:any){
  return  this.http.post(this.IP+'/riro_violation_data',data)
}
VerifyViolation(id:string,flag:any){
  return this.http.get(this.IP+'/violation_verification/'+id+'/'+flag)
}

LiveRAViolationData (cameraName?:string | null,violType?:string|null,page?:number,size?:number) {

  // cameraName=cameraName? cameraName.replace(/ /g,'_'):null

  cameraName==="all_cameras"?cameraName=null:''
  violType==="all_violations"?violType=null:''
 
  return    page && size && cameraName && violType? this.http.get(this.IP + '/live_data1RA/' + cameraName + '/'+violType+'/' + page + '/' + size): 
  !page && !size && cameraName && violType? this.http.get(this.IP + '/live_data1RA/' + cameraName + '/'+violType):
  page && size && cameraName && !violType ? this.http.get(this.IP + '/live_data1RA' + cameraName + '/' + page + '/' + size) : 
  !page && !size && !cameraName && violType ? this.http.get(this.IP + '/live_data1RA/violation/'+violType )
  : page && size && !cameraName && violType? this.http.get(this.IP + '/live_data1RA/violation/'+violType +'/'+ page + '/' + size) :
  page && size && (!cameraName) && (!violType) ? this.http.get(this.IP + '/live_data1RA/pagination/'+ page + '/' + size):
   !page && !size &&cameraName &&!violType? this.http.get(this.IP + '/live_data1RA/'  + cameraName) :
   this.http.get(this.IP + '/live_data1RA')

}


DatewiseRAViolations(from: any, to: any, page?: number|null, size?: number|null, cameraName?: string | null,violType?:string|null) {
  var fromD = this.dateTransform(from)
  var toD = this.dateTransform(to)
  console.log(fromD, toD)
  console.log(page, size)
  // cameraName=cameraName? cameraName.replace(/ /g,'_'):null

  cameraName==="all_cameras"?cameraName=null:''
  violType==="all_violations"?violType=null:''
  var body;

 violType!==null?body={from_date:fromD,to_date:toD,violation_type:violType}: body={from_date:fromD,to_date:toD}
  console.log(violType)
  console.log(this.IP + '/datewiseRA/' + cameraName + '/' + page + '/' + size)
  return    page && size && cameraName && violType? this.http.post(this.IP + '/datewiseRA_violation/' + cameraName + '/' + page + '/' + size, body): 
  !page && !size && cameraName && violType? this.http.post(this.IP + '/datewiseRA_violation/' + cameraName , body):
  page && size && cameraName ? this.http.post(this.IP + '/datewiseRA/' + cameraName + '/' + page + '/' + size, body) : 
  !page && !size && !cameraName && violType ? this.http.post(this.IP + '/datewise_violationRA' , body)
  : page && size && !cameraName && violType? this.http.post(this.IP + '/datewise_violationRA/' + page + '/' + size, body) :
  page && size && (!cameraName) && (!violType) ? this.http.post(this.IP + '/datewiseRA/'+ page + '/' + size , body):
   !page && !size &&cameraName &&!violType? this.http.post(this.IP + '/datewiseRA/'  + cameraName, body) :
   this.http.post(this.IP + '/datewiseRA', body)

}
}
