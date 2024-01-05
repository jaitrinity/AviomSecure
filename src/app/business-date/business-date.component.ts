import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Constant } from '../shared/constant/Contant';
import { SharedService } from '../shared/service/SharedService';
import { ToastrService } from 'ngx-toastr';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-business-date',
  templateUrl: './business-date.component.html',
  styleUrls: ['./business-date.component.scss']
})
export class BusinessDateComponent implements OnInit {

  isEdit: boolean = false;
  todayDate = "";
  businessDateId = 0; 
  businessDate = "";
  status = "";
  businessDateTemp = "";
  statusTemp = "";
  alertFadeoutTime = 0;
  loginEmpId = "";
  loginEmpRole = "";
  tenentId = "";
  button = "";
  color1 = "";
  color2 = "";
  constructor(private datePipe : DatePipe,private sharedService : SharedService, 
    private toastr: ToastrService,
    private layoutComponent : LayoutComponent) { 
    this.alertFadeoutTime = Constant.ALERT_FADEOUT_TIME;
    this.loginEmpId = localStorage.getItem("empId");
    this.loginEmpRole = localStorage.getItem("loginEmpRole");
    this.tenentId = localStorage.getItem("tenentId");
    this.button = localStorage.getItem("button");
    this.color1 = localStorage.getItem("color1");
    this.color2 = localStorage.getItem("color2");
    this.layoutComponent.setPageTitle("Business Date");
  }

  ngOnInit(): void {
    this.todayDate = this.datePipe.transform(new Date(),'yyyy-MM-dd');
    this.getAllList();
  }

  getAllList(){
    let jsonData = {
      loginEmpId: this.loginEmpId,
      loginEmpRole: this.loginEmpRole,
      tenentId: this.tenentId
    }
    this.sharedService.getAllListBySelectType(jsonData, 'businessDate')
    .subscribe(
      (result)=>{
        this.businessDateId = result.businessDateId;
        if(this.businessDateId !=0){
          this.businessDate = result.businessDate,
          this.status = result.status;
          this.isEdit = false;

          this.businessDateTemp = this.businessDate;
          this.statusTemp = this.status;
        }
        
      },
      (error)=>{

      }
    )
  }
  submitBusinessDate(){
    if(this.businessDate == ""){
      this.toastr.warning("please select business date","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if(this.status == ""){
      this.toastr.warning("please select status","Alert !",{timeOut : this.alertFadeoutTime});
      return ;
    }
    else if(this.businessDate == this.businessDateTemp && this.status == this.statusTemp){
      this.toastr.warning("please select new business date and status","Alert !",{timeOut : this.alertFadeoutTime});
      return;
    }
    let jsonData = {
      businessDateId: this.businessDateId,
      businessDate: this.businessDate,
      status: this.status
    }
    this.layoutComponent.ShowLoading = true;
    this.sharedService.insertDataByInsertType(jsonData, 'businessDate')
    .subscribe(
      (result)=>{
        if(result.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
          this.toastr.success(result.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
          this.isEdit = false;
          this.getAllList();
        }
        else{
          this.toastr.warning(result.responseDesc,"Alert !",{timeOut : this.alertFadeoutTime});
        }
        this.layoutComponent.ShowLoading = false;
      },
      (error)=>{
        this.toastr.warning(Constant.returnServerErrorMessage("submitBusinessDate"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
      }
    )
  }

  cancel(){
    this.businessDate = this.businessDateTemp;
    this.status = this.statusTemp;
    this.isEdit = false;
  }

}
