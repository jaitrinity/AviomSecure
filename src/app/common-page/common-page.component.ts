import { Component, OnInit, Inject } from '@angular/core';
import { TrasanctionHdrTableSetting } from '../shared/tableSettings/TrasanctionHdrTableSetting';
import { TrasanctionDetTableSetting } from '../shared/tableSettings/TrasanctionDetTableSetting';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../shared/service/SharedService';
import { ToastrService } from 'ngx-toastr';
import { Constant } from '../shared/constant/Contant';
import { CommonFunction } from '../shared/service/CommonFunction';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LayoutComponent } from '../layout/layout.component';
import * as alasql from 'alasql';
declare var $: any;

@Component({
  selector: 'app-common-page',
  templateUrl: './common-page.component.html',
  styleUrls: ['./common-page.component.css']
})
export class CommonPageComponent implements OnInit {
  isDoAnyChange : boolean = false;
  filterEmployeeId = "";
  filterTransactionId = "";
  filterStartDate = "";
  filterEndDate = "";
  categoryName = "";
  public href: string = "";
  menuId = "";
  transactionHdrList = [];
  categoryList = [];
  selectedCategoryList = [];
  subcategoryList = [];
  selectedSubcategoryList = [];
  captionList = [];
  selectedCaptionList = [];
  multiSelectdropdownSettings = {};
  singleSelectdropdownSettings = {};
  blankTableSettings :any = {};
  newSetting = TrasanctionHdrTableSetting.setting;
  transactionHdrSettings;
  transactionDetSettings = TrasanctionDetTableSetting.setting;
  loginEmpId : any = "";
  loginEmpRole : any = "";
  tenentId : any = "";
  button = "";
  color1 = "";
  color2 = "";
  formatLabel(value: number) {
    // if (value >= 1000) {
    //   return Math.round(value / 1000) + 'k';
    // }

    return value;
  }
  
  constructor(private route: ActivatedRoute,private router : Router,
    private sharedService : SharedService, private layoutComponent : LayoutComponent,
    private toastr: ToastrService,
    public dialog: MatDialog) {
      this.loginEmpId = localStorage.getItem("empId");
      this.loginEmpRole = localStorage.getItem("empRoleId");
      this.tenentId = localStorage.getItem("tenentId");
      this.button = localStorage.getItem("button");
      this.color1 = localStorage.getItem("color1");
      this.color2 = localStorage.getItem("color2");
      $(document).ready(function(){
        // alert("a")
        $('.turn').on('click', function(){
          var angle = ($('.viewImg').data('angle') + 90) || 90;
          $('.viewImg').css({'transform': 'rotate(' + angle + 'deg)'});
          $('.viewImg').data('angle', angle);
        });
      })
    }
    

  ngOnInit() {
    this.multiSelectdropdownSettings = {
      singleSelection: false,
      idField: 'paramCode',
      textField: 'paramDesc',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 0,
      allowSearchFilter: true
    };
    this.singleSelectdropdownSettings = {
      singleSelection: true,
      idField: 'paramCode',
      textField: 'paramDesc',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      closeDropDownOnSelection : true
    };
    setTimeout(() => {
      $("ng2-smart-table thead, .myTable thead").css('background-color',this.color1);
    }, 100);

    this.route.paramMap.subscribe(params => {
      // this.transactionHdrSettings = Object.assign({}, this.blankTableSettings);
      this.newSetting.columns = Object.assign({}, this.blankTableSettings);
      this.subcategoryList = [];
      this.selectedSubcategoryList = [];
      this.captionList = [];
      this.selectedCaptionList = [];
      this.filterStartDate = "";
      this.filterEndDate = "";
      this.transactionHdrList = [];
      this.menuId = params.get('menuId');
      this.categoryName = localStorage.getItem(this.menuId);
      this.layoutComponent.setPageTitle(this.categoryName);
      this.getDynamicColumn();
      this.getCategorySubcategoryByRole();
    });
  }

  getDynamicColumn(){
    let dynCol = [];
    let jsonData = {
      loginEmpId : this.loginEmpId,
      loginEmpRole : this.loginEmpRole,
      tenentId : this.tenentId,
      menuId : this.menuId
    }
    this.sharedService.getAllListBySelectType(jsonData,"dynamicColumn")
    .subscribe((response) =>{
      //console.log(response);
      dynCol = response.dynamicColumn;
      if(dynCol.length == 0){
        dynCol = [
          {columnKey : "transactionId",columnTitle:"Activity Id",columnWidth:"85px"},
          {columnKey : "fillingBy",columnTitle:"Employee Name",columnWidth:"85px"},
          {columnKey : "dateTime",columnTitle:"Date",columnWidth:"85px"},
        ];
      }
      for(let i=0;i<dynCol.length;i++){
        this.newSetting.columns[dynCol[i].columnKey] = {title:dynCol[i].columnTitle,width:dynCol[i].columnWidth};
      }
      this.transactionHdrSettings = Object.assign({}, this.newSetting);
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("getDynamicColumn"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
    });

    
  }

  reloadPage(){
    alert("Hello");
  }

  onSelectOrDeselectCategory(item: any) {}

  onSelectAllOrDeselectAllCategory(item: any) {
    this.selectedCategoryList = item;
  }

  onSelectOrDeselectSubcategory(item: any) {
    this.createCaptionList();
  }

  onSelectAllOrDeselectAllSubcategory(item: any) {
    this.selectedSubcategoryList = item;
  }

  level : any = 1;
  getCategorySubcategoryByRole(){
    let jsonData = {
      tenentId : this.tenentId,
      loginEmpRole : this.loginEmpRole,
      categoryName : this.categoryName
    }
    this.layoutComponent.ShowLoading = true;
    this.sharedService.getCategorySubcategoryByRole(jsonData)
    .subscribe((response) =>{
      //console.log(response);
      this.level = response.count;
      //console.log(this.level)
      if(this.level == 2 || this.level == 3){
        this.subcategoryList = response.wrappedList;
        this.layoutComponent.ShowLoading = false;
      }
      else {
        this.getMenuTrasactions(0);
      }
      // this.layoutComponent.ShowLoading = false;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("getCategorySubcategoryByRole"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
      this.layoutComponent.ShowLoading = false;
    });

  }

  createCaptionList(){
    if(this.level == 1 || this.level == 2){
      return ;
    }
    if(this.selectedSubcategoryList.length == 0){
      return ;
    }
    this.captionList = [];
    this.selectedCaptionList = [];
    let subCatName = CommonFunction.createCommaSeprateByParamDesc(this.selectedSubcategoryList);

    let jsonData = {
      loginEmpRole : this.loginEmpRole,
      categoryName : this.categoryName,
      subCategoryName : subCatName
    }
    //console.log(JSON.stringify(jsonData));
    // this.layoutComponent.ShowLoading = true;
    this.sharedService.getAllListBySelectType(jsonData,"caption")
    .subscribe((response) =>{
      // console.log(response);
      this.captionList = response.captionList;
      // this.layoutComponent.ShowLoading = false;
      
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("createCaptionList"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
      this.layoutComponent.ShowLoading = false;
    });
  }
  
  getMenuTrasactions(type : any){
    if((this.level == 2 || this.level == 3) && this.selectedSubcategoryList.length == 0){
      alert("select atleast one sub category");
      return;
    }
    else if(this.level == 3 && this.selectedCaptionList.length == 0){
      alert("select atleast one caption");
      return;
    }
    
    let subCatMenuIds = CommonFunction.createCommaSeprate(this.selectedSubcategoryList);
    let captionMenuIds = CommonFunction.createCommaSeprate(this.selectedCaptionList);
    this.transactionHdrList = [];
    if(type == 1)
      this.layoutComponent.ShowLoading = true;
    let json = {
      loginEmpId : this.loginEmpId,
      loginEmpRole : this.loginEmpRole,
      menuId : this.menuId,
      subCatMenuId : subCatMenuIds,
      captionMenuId : captionMenuIds,
      filterEmployeeId : this.filterEmployeeId,
      filterTransactionId : this.filterTransactionId,
      filterStartDate : this.filterStartDate,
      filterEndDate : this.filterEndDate,
      level : this.level
    }
    this.sharedService.getMenuTrasactions(json)
    .subscribe((response) =>{
     
      this.transactionHdrList = response.wrappedList;
      if(this.transactionHdrList.length == 0){
        this.toastr.info("No record found","Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
      }
      this.layoutComponent.ShowLoading = false;
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("getMenuTrasactions"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
      this.layoutComponent.ShowLoading = false;
    });
  }

  isVerifyRequired : boolean = false;
  isApprovalRequired : boolean = false;
  transactionId : any = "";
  viewMenuId : any = "";
  viewLocationId : any = "";
  viewVerifiedDate : any = "";
  viewVerifiedBy : any = "";
  viewApprovedDate : any = "";
  viewApprovedBy : any = "";
  transactionDetList = [];
  actionCheckpointList = [];
  verifyDetList = [];
  approveDetList = [];
  transactionStatus = "";
  myRoleForTask = "";
  viewState : any = "";
  viewArea : any = "";
  viewNoOfOpco : any = "";
  viewSiteName : any = "";
  viewNoOfBTS_Indoor : any = "";
  viewNoOfBTS_Outdoor : any = "";
  dateOfVisit : any = "";
  area : any = "";
  technicianName : any = "";
  siteSurveyStatus = "";
  siteSurveyRemark = "";
  nominalLatlong = "";
  viewDetails(event){
    this.isDoAnyChange = false;
    this.isVerifyRequired = false;
    this.isApprovalRequired = false;
    this.myRoleForTask = "";
    this.transactionStatus = "";
    this.transactionDetList = [];
    this.actionCheckpointList = [];
    this.verifyDetList = [];
    this.approveDetList = [];
    this.transactionId = event.data.transactionId;
    this.viewMenuId = event.data.menuId;
    let verifierTId = event.data.verifierTId;
    let approvedTId = event.data.approvedTId;
    this.transactionStatus = event.data.status;
    this.myRoleForTask = event.data.myRoleForTask;
    this.viewVerifiedDate = event.data.verifiedDate;
    this.viewVerifiedBy = event.data.verifiedBy;
    this.viewApprovedDate = event.data.approvedDate;
    this.viewApprovedBy = event.data.approvedBy;
    this.dateOfVisit = event.data.dateTime;
    this.viewState = event.data.fillingByState;
    this.viewArea = event.data.fillingByArea;
    this.technicianName = event.data.fillingBy;
    this.siteSurveyStatus = event.data.siteSurveyStatus;
    this.siteSurveyRemark = event.data.siteSurveyRemark;
    this.nominalLatlong = event.data.nominalLatlong;
    let jsonData = {
      loginEmpId : this.loginEmpId,
      menuId : this.viewMenuId,
      transactionId : this.transactionId,
      verifierTId : verifierTId,
      approvedTId : approvedTId,
      status : this.transactionStatus
    }
    this.layoutComponent.ShowLoading = true;
    this.sharedService.getMenuTrasactionsDet(jsonData)
    .subscribe((response) =>{
      this.transactionDetList = response.wrappedList[0].transactionDetList; 
      this.actionCheckpointList = response.wrappedList[0].actionCheckpointList; 
      this.verifyDetList = response.wrappedList[0].verifyDetList; 
      this.approveDetList = response.wrappedList[0].approveDetList; 
      this.viewLocationId = response.wrappedList[0].locationId; 

      for(let i=0;i<this.transactionDetList.length;i++){
        let forVerifier = this.transactionDetList[i].forVerifier;
        let forApprover = this.transactionDetList[i].forApprover;
        if(forVerifier == "Yes"){
          this.isVerifyRequired = true;
        }
        if(forApprover == "Yes"){
          this.isApprovalRequired = true;
        }

        let checkpointId = this.transactionDetList[i].checkpointId;
        let value = this.transactionDetList[i].value;
        if(checkpointId == 4715) this.viewNoOfOpco = value;
        if(checkpointId == 4717 || checkpointId == 4726) this.viewSiteName = value;
        if(checkpointId == 4718) this.viewNoOfBTS_Outdoor = value;
        if(checkpointId == 4719) this.viewNoOfBTS_Indoor = value;
        // if(checkpointId == 4720) this.technicianName = value;
      }
      $("#viewDetailsModal").modal({
        backdrop : 'static',
        keyboard : false
      });
      setTimeout(() => {
        $("ng2-smart-table thead, .myTable thead").css('background-color',this.color1);
      }, 100);
      this.layoutComponent.ShowLoading = false;
    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("transactionDetList"),"Alert !",{timeOut : Constant.TOSTER_FADEOUT_TIME});
      this.layoutComponent.ShowLoading = false;
    });

  }

  validatedData = [];
  validateChangeStatus() : any{
    this.validatedData = [];
    for(var i=0;i<this.actionCheckpointList.length;i++){
      var typeId = this.actionCheckpointList[i].typeId;
      var checkpointId = this.actionCheckpointList[i].checkpointId;
      if(typeId == 1 || typeId == 2 || typeId == 3 || typeId == 7){
        var textObj = $("#action-"+checkpointId);
        if(textObj.val().trim()!=""){
          let filledJson = {
            checkpointId : checkpointId,
            checkpointValue : textObj.val().trim(),
            typeId : typeId,
            dependChpId : 0
          }
          this.validatedData.push(filledJson);
        }
        else{
          alert("please enter "+checkpointId+" value ");
          return false;
        }
      }
      else if(typeId == 10){
        var textObj = $("#action-"+checkpointId);
        if(textObj.val().trim()!=""){
          let filledJson = {
            checkpointId : checkpointId,
            checkpointValue : textObj.val().trim(),
            typeId : typeId,
            dependChpId : 0
          }
          this.validatedData.push(filledJson);
        }
        else{
          alert("please select "+checkpointId+" option ");
          return false;
        }
      }
      else if(typeId == 4){
        let isChecked = false;
        let answer = "";
        $(".action-"+checkpointId).each(function(){
          if($(this).prop("checked")){
            answer = $(this).val();
            isChecked = true;
          }
        });

        if(isChecked){
          let filledJson = {
            checkpointId : checkpointId,
            checkpointValue : answer,
            typeId : typeId,
            dependChpId : 0
          }
          this.validatedData.push(filledJson);
        }
        else{
          alert("please select atlease one option of "+checkpointId);
          return false;
        }
      }
      else if(typeId == 5 || typeId == 6){
        var textObj = $("#hidden-"+checkpointId);
        if(textObj.val().trim()!=""){
          let filledJson = {
            checkpointId : checkpointId,
            checkpointValue : textObj.val().trim(),
            typeId : typeId,
            dependChpId : 0
          }
          this.validatedData.push(filledJson);
        }
        else{
          alert("please brower an image in "+checkpointId);
          return false;
        }
        
      }
      else if(typeId == 12){
        var textObj = $("#hidden-"+checkpointId);
        if(textObj.val().trim()!=""){
          let filledJson = {
            checkpointId : checkpointId,
            checkpointValue : textObj.val().trim(),
            typeId : typeId,
            dependChpId : 0
          }
          this.validatedData.push(filledJson);
        }
        else{
          alert("please brower a video in "+checkpointId);
          return false;
        }
        
      }
      
    }
    return true;
  }

  remark : any = "";
  changeTransactionStatus(status){
    if(!this.validateChangeStatus()){
      return false;
    }

    for(let i=0;i<$(".dependentQues:visible").length;i++){
      let obj = $(".dependentQues:visible")[i];
      let typeId = $(obj).attr("typeId");
      let checkpointId = $(obj).attr("checkpointId");
      let dependChpId = $(obj).attr("dependChpId");
      // alert($(this +" input[type='text']").val());
      let v = $(obj).children("input[type='text']").val();
      if(v == undefined) v = $(obj).children("select").val();
      // alert(v);

      let filledJson = {
        checkpointId : checkpointId,
        checkpointValue : v,
        typeId : typeId,
        dependChpId : dependChpId
      }
      this.validatedData.push(filledJson);

    }

    this.layoutComponent.ShowLoading = true;
    let json = {
      "loginEmpId" : this.loginEmpId,
      "loginEmpRole" : this.loginEmpRole,
      "transactionId" : this.transactionId,
      "menuId" : this.viewMenuId,
      "locationId" : this.viewLocationId,
      "status" : status,
      "validatedDataList" : this.validatedData
    }
    // console.log(JSON.stringify(json));
    this.sharedService.changeTransactionStatus(json)
    .subscribe((response) =>{
      if(response.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
        this.toastr.success("Update successfully","Alert",{timeOut : Constant.TOSTER_FADEOUT_TIME});
        $("#viewDetailsModal").modal("hide");
        this.remark = "";
        this.layoutComponent.ShowLoading = false;
        this.getMenuTrasactions(0);
      }
      else{
        this.toastr.error('Something went wrong', 'Alert',{timeOut : Constant.TOSTER_FADEOUT_TIME});
        this.layoutComponent.ShowLoading = false;
      }

    },
    (error)=>{
      this.toastr.warning(Constant.returnServerErrorMessage("changeTransactionStatus"),"Alert",{timeOut : Constant.TOSTER_FADEOUT_TIME});
      this.layoutComponent.ShowLoading = false;
    });
  }

  actionOnTransaction(status : any){
    // Status : 1=Activate, 0=Deactivate
    let jsonData = {
      remark : this.remark,
      transactionId : this.transactionId,
      status : status
    };

    this.sharedService.actionOnDataByUpdateType(jsonData, "actionOnTransaction")
    .subscribe(
      (response)=>{
        if(response.responseCode == Constant.SUCCESSFUL_STATUS_CODE){
          this.toastr.success(response.responseDesc,"Alert !");
          this.closeAnyModal("viewDetailsModal");
          this.getMenuTrasactions(1);
        }
        else{
          this.toastr.warning(response.responseDesc,"Alert !");
        }
        this.layoutComponent.ShowLoading = false;
      },
      (error)=>{
        this.toastr.warning(Constant.returnServerErrorMessage("actionOnTransaction"),"Alert",{timeOut : Constant.TOSTER_FADEOUT_TIME});
      });
  }

  closeModal(){
    if(this.isDoAnyChange){
      let isConfirm = confirm("Do you want to close?");
      if(isConfirm){
        $("#viewDetailsModal").modal("hide");
        this.isVerifyRequired = false;
        this.isApprovalRequired = false;
        this.remark = "";
      }
    }
    else{
      $("#viewDetailsModal").modal("hide");
      this.isVerifyRequired = false;
      this.isApprovalRequired = false;
      this.remark = "";
    }
    
  }

  changeListener($event,chkId): void {
    this.readThis($event.target,chkId);
    this.isDoAnyChange = true;
  }

  readThis(inputValue: any,chkId): void {
    var file: File = inputValue.files[0];
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      let image = myReader.result;
      $("#hidden-"+chkId).val(image);
    }
    myReader.readAsDataURL(file);
  }

  viewImgUrl: any="";
  openMedia(v){

    this.viewImgUrl = v;
    this.closeAndOpenModel('viewDetailsModal','viewImageModal');

    // alert(v);
    // window.open(v);

    // let newWin = window.open("", "MsgWindow", "");
    // newWin.document.write("<img src='"+v+"' width='50%' height='100%'/>");

    // let url = v;
    // let base64 = "";
    // this.toDataURL(url, function (dataUrl:any) {
    //   base64 = dataUrl;
    //   console.log("a:: "+dataUrl)
    // })
    // console.log("b:: "+base64);
  }

  // toDataURL(url:any, callback:any) {
  //   var xhr = new XMLHttpRequest();
  //   xhr.onload = function () {
  //       var reader = new FileReader();
  //       reader.onloadend = function () {
  //           callback(reader.result);
  //       }
  //       reader.readAsDataURL(xhr.response);
  //   };
  //   xhr.open('GET', url);
  //   xhr.responseType = 'blob';
  //   xhr.send();
  // }

  showDependent(event, cpId, logicCp,typeId){
    // console.log(event)
    $(".dependentQues_"+cpId).hide();
    let depCp = logicCp.split(":");
    if(typeId == 10){
      let selectedIndex = event.target.selectedIndex;
      let depLogic = depCp[selectedIndex-1].split(",");
      for(let i=0;i<depLogic.length;i++){
        $("#dep_"+cpId+"_"+depLogic[i]).show();
      }
    }
    else if(typeId == 4){
      let checked = event.target.checked;
      let defaultValue = event.target.defaultValue;
      let selectedIndex = 1;
      if(defaultValue == "No") selectedIndex = 2;
      if(checked){
        let depLogic = depCp[selectedIndex-1].split(",");
        for(let i=0;i<depLogic.length;i++){
          $("#dep_"+cpId+"_"+depLogic[i]).show();
        }
      }
    }    
  }

  exportData(){
    if(this.transactionHdrList.length != 0){
      let sql = "SELECT transactionId as `Activity Id`, fillingBy as `Employee Name`, dateTime as `Date` ";
      sql += 'INTO XLSXML("Shakti_Enrolment_Report.xls",{headers:true}) FROM ?';
      alasql(sql,[this.transactionHdrList]);
    }
    else{
      alert("No data for export");
    }
  }

  exportTransactionDet(){
    let exportDataList = [];
    let circleJson = {
      srNumber : "",
      checkpoint : "Circle",
      filledValue : this.viewState
    }
    exportDataList.push(circleJson);
    let dateOfVisitJson = {
      srNumber : "",
      checkpoint : "Date Of Visit",
      filledValue : this.dateOfVisit
    }
    exportDataList.push(dateOfVisitJson);
    let techNameJson = {
      srNumber : "",
      checkpoint : "Employee Name",
      filledValue : this.technicianName
    }
    exportDataList.push(techNameJson);

    // for blank row in excel
    let blankJson = {
      srNumber : "",
      checkpoint : "",
      filledValue : ""
    }
    exportDataList.push(blankJson);
    for(let i=0;i<this.transactionDetList.length;i++){
      let exportJson = {
        srNumber : this.transactionDetList[i].srNumber,
        checkpoint : this.transactionDetList[i].checkpoint,
        filledValue : this.transactionDetList[i].value
      }
      exportDataList.push(exportJson);
    }
    
    exportDataList.push(blankJson);

    for(let i=0;i<this.verifyDetList.length;i++){
      let exportJson = {
        srNumber : this.verifyDetList[i].srNumber,
        checkpoint : this.verifyDetList[i].checkpoint,
        filledValue : this.verifyDetList[i].value
      }
      exportDataList.push(exportJson);
    }

    let sql = "SELECT srNumber as `SR No`, checkpoint as `Checkpoint`, filledValue as `Value` ";
      sql += 'INTO XLSXML("Site_Survey_Report.xls",{headers:true}) FROM ?';
      alasql(sql,[exportDataList]);
  }

  downloadImg(){
    this.sharedService.downloadImage(this.viewImgUrl)
  }

  openAnyModal(modalId: string){
    $("#"+modalId).modal({
      backdrop : 'static',
      keyboard : false
    });
  }
  closeAnyModal(modalName : string){
    this.remark = "";
    $("#"+modalName).modal("hide");
  }

  closeAndOpenModel(closeModalId,openModalId){
    this.closeAnyModal(closeModalId);
    this.openAnyModal(openModalId)
  }
}