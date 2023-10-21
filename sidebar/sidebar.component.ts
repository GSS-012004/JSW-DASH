import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServerService } from 'src/app/Services/server.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit ,AfterViewInit{
   isCollapse:boolean=false
  constructor(private router:Router,public server:ServerService) { 
  
    this.server.isCollapse.subscribe((value:any)=>{
      this.isCollapse=value
      console.log('iscollapse',this.isCollapse)

    })
   
    console.log(this.isCollapse,'collapse')
  }

  ngOnInit(): void {
  }
ngAfterViewInit(): void {
   this.isCollapse=<boolean> <any>localStorage.getItem('isCollapse')
   console.log(this.isCollapse)
  
}  Logout(){
    var confir=confirm('Do you want to log out?')
    if(confir){
    localStorage.removeItem('session')
    console.log('logout')
    this.router.navigate(['/login'])
  }
}

toggleSidebar(){
   var sidebarWrapper=document.getElementById('sidebarWrapper')
  var sidebar=document.getElementById('sidebar')
  var wrapper=document.getElementsByClassName('dashboard-wrapper')[0]
  console.log(wrapper)
  sidebarWrapper.classList.toggle('active')
  sidebar.classList.toggle('active')
  wrapper.classList.toggle('active')
}
}
